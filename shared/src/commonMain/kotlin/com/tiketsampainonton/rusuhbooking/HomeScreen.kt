package com.tiketsampainonton.rusuhbooking

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInParent
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(onEvent: (MockEvent) -> Unit) {
    val scroll = rememberScrollState()
    val scope = rememberCoroutineScope()
    var featuredY by remember { mutableStateOf(0) }
    var sellingY by remember { mutableStateOf(0) }
    var footerY by remember { mutableStateOf(0) }
    var query by remember { mutableStateOf("") }
    var filter by remember { mutableStateOf("Semua") }
    var info by remember { mutableStateOf<String?>(null) }
    BoxWithConstraints(Modifier.fillMaxSize().background(Paper)) {
        val compact = maxWidth < 720.dp
        val columns = if (maxWidth < 620.dp) 1 else if (maxWidth < 900.dp) 2 else 3
        val heroHeight = if (compact) 760.dp else maxOf(maxHeight, 700.dp)
        Column(Modifier.fillMaxSize().verticalScroll(scroll)) {
            HomeHero(compact, heroHeight, onEvent, onDiscover = { scope.launch { scroll.animateScrollTo(featuredY) } })
            Row(Modifier.fillMaxWidth().background(Ink).horizontalScroll(rememberScrollState()).padding(vertical = 18.dp, horizontal = 20.dp), horizontalArrangement = Arrangement.spacedBy(38.dp)) {
                listOf("Antrean adil FCFS", "Timer server-authoritative", "Anti-oversell", "Maks 3 tiket / NIK", "Pembayaran aman", "E-tiket instan").forEach { Copy("●  $it", 13, Color.White.copy(alpha = .55f), FontWeight.Bold) }
            }
            Column(Modifier.align(Alignment.CenterHorizontally).widthIn(max = 1180.dp).fillMaxWidth().onGloballyPositioned { featuredY = it.positionInParent().y.toInt() }.padding(horizontal = 20.dp, vertical = 84.dp), verticalArrangement = Arrangement.spacedBy(26.dp)) {
                Column(verticalArrangement = Arrangement.spacedBy(13.dp)) {
                    Pill("●  SEDANG BERLANGSUNG")
                    Heading("Konser pilihan minggu ini", if (compact) 30 else 42)
                    Copy("Pilih event, masuk waiting room, dan amankan tiketmu. Posisi antrean real-time, tanpa PHP.", 14, Muted)
                }
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(Modifier.fillMaxWidth().background(Color.White, CircleShape).border(1.dp, LightLine, CircleShape).padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Canvas(Modifier.size(18.dp)) {
                            drawCircle(Muted, size.width * .31f, Offset(size.width * .4f, size.height * .4f), style = androidx.compose.ui.graphics.drawscope.Stroke(1.5.dp.toPx()))
                            drawLine(Muted, Offset(size.width * .64f, size.height * .64f), Offset(size.width * .94f, size.height * .94f), 1.5.dp.toPx(), cap = androidx.compose.ui.graphics.StrokeCap.Round)
                        }
                        BasicTextField(query, { query = it }, Modifier.fillMaxWidth(), singleLine = true, textStyle = TextStyle(fontFamily = LocalTextStyle.current.fontFamily, color = Ink, fontSize = 13.sp), decorationBox = { field -> Box { if (query.isEmpty()) Copy("Cari konser, venue, atau kota", 13, Muted); field() } })
                    }
                    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        listOf("Semua", "Jakarta", "Surabaya", "Festival").forEach { label ->
                            Box(Modifier.clip(CircleShape).background(if (filter == label) Ink else Color.Transparent).border(1.dp, LightLine, CircleShape).clickable { filter = label }.padding(horizontal = 16.dp, vertical = 11.dp)) { Copy(label, 12, if (filter == label) Color.White else Muted, FontWeight.SemiBold) }
                        }
                    }
                }
                val events = filterEvents(query, filter)
                if (events.isEmpty()) Panel(Modifier.fillMaxWidth()) { Copy("Belum ada event yang cocok. Coba kata kunci lain.", color = Muted) }
                EventGrid(events, columns, onEvent)
            }
            Column(Modifier.align(Alignment.CenterHorizontally).widthIn(max = 1180.dp).fillMaxWidth().onGloballyPositioned { sellingY = it.positionInParent().y.toInt() }.padding(horizontal = 20.dp).padding(bottom = 72.dp), verticalArrangement = Arrangement.spacedBy(28.dp)) {
                Column(verticalArrangement = Arrangement.spacedBy(13.dp)) {
                    Pill("●  SELLING FAST", Amber)
                    Heading("Hampir habis — buruan", if (compact) 30 else 42)
                    Copy("Stok menipis. Angka ini real-time dari server (total − terjual − sedang di-hold).", color = Muted)
                }
                EventGrid(MockFixtures.fast, columns, onEvent)
            }
            Column(Modifier.fillMaxWidth().onGloballyPositioned { footerY = it.positionInParent().y.toInt() }.background(Ink).padding(horizontal = 24.dp, vertical = 48.dp), verticalArrangement = Arrangement.spacedBy(30.dp)) {
                Brand(true)
                Copy("Platform booking tiket konser online yang tetap adil dan stabil saat ribuan orang menyerbu sekaligus.", 13, Color.White.copy(alpha = .6f), modifier = Modifier.widthIn(max = 340.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(if (compact) 24.dp else 80.dp)) {
                    listOf("Kategori" to listOf("Musik", "Festival", "Jazz", "Rock"), "Bantuan" to listOf("Cara Booking", "Aturan NIK", "Refund", "Kontak"), "Perusahaan" to listOf("Tentang", "Karier", "Privasi")).forEach { (title, links) ->
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Copy(title, 14, Color.White, FontWeight.Bold)
                            links.forEach { link -> Copy(link, 12, Color.White.copy(alpha = .6f), modifier = Modifier.clickable { if (title == "Kategori") { filter = if (link == "Musik") "Semua" else link; scope.launch { scroll.animateScrollTo(featuredY) } } else info = link }) }
                        }
                    }
                }
                HorizontalDivider(color = DarkLine)
                Copy("© 2026 Rusuh Tiket · PT. Tiga Sekawan Angin Ribut\nPrototype — assessment Telkomsel", 11, Color.White.copy(alpha = .45f))
            }
        }
        Row(Modifier.align(Alignment.TopCenter).padding(top = 16.dp, start = 14.dp, end = 14.dp).clip(CircleShape).background(Color.White.copy(alpha = .94f)).border(1.dp, Color.White.copy(alpha = .6f), CircleShape).padding(start = 14.dp, end = 8.dp, top = 7.dp, bottom = 7.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(if (compact) 12.dp else 22.dp)) {
            Brand(onClick = { scope.launch { scroll.animateScrollTo(0) } })
            if (!compact) listOf("Jelajah" to featuredY, "Selling Fast" to sellingY, "Kategori" to footerY).forEach { (label, y) -> TextButton(onClick = { scope.launch { scroll.animateScrollTo(y) } }) { Copy(label, 13, Muted, FontWeight.SemiBold) } }
            Action("Masuk Antrean", arrow = !compact, onClick = { scope.launch { scroll.animateScrollTo(featuredY) } })
        }
    }
    info?.let { title -> AlertDialog(onDismissRequest = { info = null }, title = { Heading(title, 22) }, text = { Copy(when (title) { "Cara Booking" -> "Pilih event → masuk waiting room → pilih kategori tiket → isi NIK → lanjut pembayaran."; "Aturan NIK" -> "Maksimal 3 tiket per NIK untuk satu event. Nomor NIK harus terdiri dari 16 digit."; "Refund" -> "Pesanan kedaluwarsa tidak dikenakan biaya. Ketentuan refund mengikuti penyelenggara event."; else -> "Rusuh Tiket — prototype booking konser untuk assessment Telkomsel." }) }, confirmButton = { TextButton(onClick = { info = null }) { Text("Tutup") } }) }
}

@Composable
private fun HomeHero(compact: Boolean, height: androidx.compose.ui.unit.Dp, onEvent: (MockEvent) -> Unit, onDiscover: () -> Unit) {
    var slide by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) { while (true) { delay(4200); slide = (slide + 1) % 3 } }
    val event = MockFixtures.featured[slide]
    Box(Modifier.fillMaxWidth().height(height)) {
        Crossfade(event, modifier = Modifier.matchParentSize()) { EventPhoto(it, Modifier.fillMaxSize(), hero = true) }
        Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Ink.copy(alpha = .35f), Ink.copy(alpha = .2f), Ink.copy(alpha = .78f), Ink.copy(alpha = .98f)))))
        Canvas(Modifier.matchParentSize()) {
            val step = 72.dp.toPx()
            var x = 0f
            while (x < size.width) { drawLine(Color.White.copy(alpha = .035f), Offset(x, 0f), Offset(x, size.height)); x += step }
            var y = 0f
            while (y < size.height) { drawLine(Color.White.copy(alpha = .035f), Offset(0f, y), Offset(size.width, y)); y += step }
            drawRect(Brush.radialGradient(listOf(Red.copy(alpha = .25f), Color.Transparent), Offset(size.width * .3f, size.height * .25f), size.width * .7f))
        }
        Text("RUSUH TIKET · LIVE NOW", Modifier.align(Alignment.TopStart).padding(top = if (compact) 210.dp else 180.dp), fontSize = if (compact) 74.sp else 130.sp, fontWeight = FontWeight.ExtraBold, color = Color.White.copy(alpha = .045f), maxLines = 1)
        Row(Modifier.align(Alignment.BottomCenter).widthIn(max = 1180.dp).fillMaxWidth().padding(horizontal = 20.dp).padding(bottom = if (compact) 40.dp else 74.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(40.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                Pill("●  LIVE · FLASH SALE", dark = true)
                Heading(event.title, if (compact) 48 else 76, Color.White, Modifier.widthIn(max = if (compact) 380.dp else 620.dp))
                Copy("${event.venue}   ·   ${event.date}   ·   ${event.time}", 14, Color.White.copy(alpha = .82f))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Action("Booking Sekarang", inverse = true, onClick = { onEvent(event) })
                    Action("Lihat Detail", inverse = true, ghost = true, arrow = false, onClick = onDiscover)
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Copy("Sisa ${grouped(event.available)} tiket", 12, Ember, FontWeight.Bold)
                    StockBar(.18f, Modifier.width(if (compact) 80.dp else 150.dp))
                    if (!compact) Copy("habis cepat", 12, Color.White.copy(alpha = .7f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                    repeat(3) { index -> Box(Modifier.size(width = if (slide == index) 26.dp else 9.dp, height = 9.dp).clip(CircleShape).background(if (slide == index) Red else Color.White.copy(alpha = .3f)).semantics { contentDescription = "Tampilkan ${MockFixtures.featured[index].title}" }.clickable { slide = index }) }
                }
                Copy("0${slide + 1} / 03     ━━━━━━━━━     LIVE PICKS", 10, Color.White.copy(alpha = .5f))
            }
            if (!compact) Panel(Modifier.width(260.dp), dark = true, padding = 18) {
                Copy("PULSE MONITOR                 ● LIVE NOW", 9, Color.White.copy(alpha = .6f), FontWeight.SemiBold)
                Copy("Pesta Rakyat Fest", 17, Color.White, FontWeight.ExtraBold)
                Copy("GBK · 24 Des 2026 · 19:00 WIB", 11, Color.White.copy(alpha = .6f))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { StatTile("12.4k", "fans in queue", Modifier.weight(1f)); StatTile("78%", "capacity active", Modifier.weight(1f)) }
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically, modifier = Modifier.height(28.dp)) { listOf(8,16,22,13,19,9,16,11,20,13).forEach { Box(Modifier.width(3.dp).height(it.dp).background(RedGradient, CircleShape)) } }
            }
        }
    }
}

@Composable
fun StatTile(value: String, label: String, modifier: Modifier = Modifier) {
    Column(modifier.background(Color.White.copy(alpha = .04f), RoundedCornerShape(14.dp)).border(1.dp, DarkLine, RoundedCornerShape(14.dp)).padding(12.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Copy(value, if (value.contains("/")) 14 else 19, Color.White, FontWeight.ExtraBold)
        Copy(label, 9, Color.White.copy(alpha = .55f))
    }
}

@Composable
private fun EventGrid(events: List<MockEvent>, columns: Int, onEvent: (MockEvent) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(22.dp)) {
        events.chunked(columns).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(22.dp)) {
                row.forEach { event -> EventCard(event, Modifier.weight(1f), onEvent) }
                repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun EventCard(event: MockEvent, modifier: Modifier, onEvent: (MockEvent) -> Unit) {
    val statusColor = when (event.status) { "hot" -> Red; "low" -> Amber; "sold" -> Muted; else -> Green }
    Column(modifier.clip(RoundedCornerShape(26.dp)).background(Ink.copy(alpha = .03f)).border(1.dp, LightLine, RoundedCornerShape(26.dp)).clickable(enabled = event.available > 0) { onEvent(event) }.padding(7.dp)) {
        Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f).clip(RoundedCornerShape(20.dp))) {
            EventPhoto(event, Modifier.matchParentSize())
            Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent, Ink.copy(alpha = .2f)))))
            Box(Modifier.align(Alignment.TopStart).padding(12.dp).background(statusColor.copy(alpha = .9f), CircleShape).padding(horizontal = 11.dp, vertical = 6.dp)) { Copy(event.badge.uppercase(), 10, Color.White, FontWeight.Bold) }
            if (event.available > 0) Box(Modifier.align(Alignment.BottomEnd).padding(12.dp).background(Color.White.copy(alpha = .95f), CircleShape).padding(horizontal = 12.dp, vertical = 7.dp)) { Copy("Rp ${event.price / 1000}rb", 13, Ink, FontWeight.ExtraBold) }
        }
        Column(Modifier.padding(13.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Heading(event.title, 18)
            Copy("${event.venue} · ${event.city}", 12, Muted)
            HorizontalDivider(color = LightLine)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Copy(if (event.available == 0) "SOLD OUT" else "Sisa ${grouped(event.available)}", 12, statusColor, FontWeight.SemiBold)
                Box(Modifier.size(36.dp).background(if (event.available == 0) Muted else Ink, CircleShape), contentAlignment = Alignment.Center) { Copy(if (event.available == 0) "×" else "↗", 18, Color.White) }
            }
        }
    }
}
