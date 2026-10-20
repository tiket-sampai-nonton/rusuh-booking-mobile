package com.tiketsampainonton.rusuhbooking

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.HTMLIFrameElement
import org.w3c.dom.MessageEvent
import org.w3c.dom.events.Event

@Composable
actual fun PaymentWebView(html: String, onAction: (PaymentAction) -> Unit, modifier: Modifier) {
    val callback by rememberUpdatedState(onAction)
    DisposableEffect(html) {
        val frame = document.createElement("iframe") as HTMLIFrameElement
        frame.srcdoc = html
        frame.setAttribute("title", "Pembayaran Rusuh Tiket — demo")
        frame.setAttribute("style", "position:fixed;inset:0;width:100%;height:100%;border:0;background:#fbfbfd;z-index:100")
        frame.setAttribute("sandbox", "allow-forms allow-scripts allow-same-origin")
        val listener: (Event) -> Unit = { event ->
            val message = event as? MessageEvent
            if (message != null && message.source == frame.contentWindow && message.origin == window.location.origin) {
                (message.data as? String)?.let(::paymentAction)?.let(callback)
            }
        }
        window.addEventListener("message", listener)
        document.body?.appendChild(frame)
        onDispose { window.removeEventListener("message", listener); frame.remove() }
    }
}

@Composable
actual fun MockBackHandler(enabled: Boolean, onBack: () -> Unit) = Unit
