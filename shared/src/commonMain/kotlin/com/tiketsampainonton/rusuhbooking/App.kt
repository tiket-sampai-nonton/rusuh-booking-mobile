package com.tiketsampainonton.rusuhbooking

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.tiketsampainonton.rusuhbooking.resources.Res
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.time.Clock
import kotlin.io.encoding.Base64

@Composable
fun App() {
    var route by remember { mutableStateOf(MockRoute.Home) }
    var event by remember { mutableStateOf(MockFixtures.featured.first()) }
    var order by remember { mutableStateOf(MockOrder()) }
    var position by remember { mutableStateOf(MockFixtures.queuePosition) }
    var detailDeadline by remember { mutableStateOf(0L) }
    var paymentDeadline by remember { mutableStateOf(0L) }
    var heldOrder by remember { mutableStateOf<MockOrder?>(null) }
    var now by remember { mutableStateOf(Clock.System.now().toEpochMilliseconds()) }
    var holding by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val seconds = (((if (route == MockRoute.Payment) paymentDeadline else detailDeadline) - now) / 1000).toInt().coerceAtLeast(0)
    fun openEvent(value: MockEvent) { heldOrder = null; paymentDeadline = 0L; event = value; order = MockOrder(); notice = null; route = MockRoute.Event }
    fun joinQueue() { heldOrder = null; paymentDeadline = 0L; position = MockFixtures.queuePosition; order = MockOrder(); notice = null; route = MockRoute.Waiting }
    fun enterDetail() { detailDeadline = Clock.System.now().toEpochMilliseconds() + MockFixtures.detailSeconds * 1000L; now = Clock.System.now().toEpochMilliseconds(); route = MockRoute.Detail }
    fun back() { route = when (route) { MockRoute.Event -> MockRoute.Home; MockRoute.Waiting -> MockRoute.Event; MockRoute.Detail -> MockRoute.Event; MockRoute.Payment -> MockRoute.Detail; else -> MockRoute.Home } }
    LaunchedEffect(route) {
        if (route == MockRoute.Waiting) while (position > 0) { delay(650); position = (position - 347).coerceAtLeast(0) }
        if (route == MockRoute.Detail || route == MockRoute.Payment) while (true) {
            now = Clock.System.now().toEpochMilliseconds()
            val deadline = if (route == MockRoute.Payment) paymentDeadline else detailDeadline
            if (now >= deadline) { holding = false; route = MockRoute.Expired; break }
            delay(250)
        }
    }
    MockTheme {
        MockBackHandler(route != MockRoute.Home && !holding, ::back)
        when (route) {
            MockRoute.Home -> HomeScreen(::openEvent)
            MockRoute.Event -> EventScreen(event, { route = MockRoute.Home }, ::joinQueue)
            MockRoute.Waiting -> WaitingScreen(event, position, { route = MockRoute.Home }, ::enterDetail)
            MockRoute.Detail -> DetailScreen(event, order, seconds, holding, notice,
                onOrder = { order = it; notice = null }, onBack = { if (!holding) back() }, onPay = {
                    if (order.canPay && !holding) {
                        holding = true
                        scope.launch {
                            delay(1100)
                            if (route == MockRoute.Detail) {
                                if (order.tier?.id == "vip" && !order.vipSoldOut) {
                                    order = order.simulateVipContention()
                                    notice = "Maaf, VIP Standing baru saja habis. Slot antreanmu masih aman — pilih kategori lain."
                                } else {
                                    if (heldOrder != order || paymentDeadline <= Clock.System.now().toEpochMilliseconds()) {
                                        paymentDeadline = Clock.System.now().toEpochMilliseconds() + MockFixtures.paymentSeconds * 1000L
                                        heldOrder = order
                                    }
                                    detailDeadline = paymentDeadline
                                    route = MockRoute.Payment
                                }
                            }
                            holding = false
                        }
                    }
                },
            )
            MockRoute.Payment -> PaymentScreen(event, order, paymentDeadline, onAction = {
                route = when (it) { PaymentAction.Back -> MockRoute.Detail; PaymentAction.Success -> if (Clock.System.now().toEpochMilliseconds() < paymentDeadline) MockRoute.Success else MockRoute.Expired; PaymentAction.Expired -> MockRoute.Expired }
            })
            MockRoute.Success, MockRoute.Expired -> ResultScreen(event, order, route == MockRoute.Success, { route = MockRoute.Home }, { openEvent(event) })
        }
    }
}

@Composable
private fun PaymentScreen(event: MockEvent, order: MockOrder, deadline: Long, onAction: (PaymentAction) -> Unit) {
    var html by remember(event, order, deadline) { mutableStateOf<String?>(null) }
    LaunchedEffect(event, order, deadline) {
        val source = Res.readBytes("files/payment.html").decodeToString()
        val image = "data:image/jpeg;base64," + Base64.encode(Res.readBytes("drawable/${event.id}.jpg"))
        html = paymentHtml(source, event, order, ((deadline - Clock.System.now().toEpochMilliseconds()) / 1000).toInt(), image)
    }
    html?.let { PaymentWebView(it, onAction, Modifier.fillMaxSize()) }
        ?: Box(Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) { CircularProgressIndicator() }
}

fun paymentHtml(template: String, event: MockEvent, order: MockOrder, seconds: Int, image: String = ""): String {
    val replacements = mapOf(
        "__IMAGE__" to image, "__EVENT__" to event.title, "__VENUE__" to event.venue, "__DATE__" to event.date, "__TIME__" to event.time,
        "__CATEGORY__" to (order.tier?.name ?: ""), "__QTY__" to order.quantity.toString(), "__SUBTOTAL__" to rupiah(order.subtotal),
        "__FEE__" to rupiah(MockFixtures.serviceFee), "__TOTAL__" to rupiah(order.total),
        "__MASKED_NIK__" to "${order.nik.take(4)}••••••••${order.nik.takeLast(4)}", "__REMAINING__" to seconds.coerceAtLeast(0).toString(),
    )
    return replacements.entries.fold(template) { html, (key, value) -> html.replace(key, value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;")) }
}

@Composable
expect fun PaymentWebView(html: String, onAction: (PaymentAction) -> Unit, modifier: Modifier = Modifier)

@Composable
expect fun MockBackHandler(enabled: Boolean, onBack: () -> Unit)
