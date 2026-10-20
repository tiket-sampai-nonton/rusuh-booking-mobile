package com.tiketsampainonton.rusuhbooking

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Modifier
import kotlinx.browser.document
import org.w3c.dom.HTMLIFrameElement

@Composable
actual fun PaymentWebView(url: String, modifier: Modifier) {
    // Browser equivalent of a payment WebView: an isolated embedded payment page.
    DisposableEffect(url) {
        val frame = document.createElement("iframe") as HTMLIFrameElement
        frame.src = url
        frame.setAttribute("title", "Payment")
        frame.setAttribute("style", "position:fixed;inset:64px 0 0;width:100%;height:calc(100% - 64px);border:0")
        frame.setAttribute("sandbox", "allow-forms allow-scripts allow-same-origin allow-popups")
        document.body?.appendChild(frame)
        onDispose { frame.remove() }
    }
}
