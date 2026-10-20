package com.tiketsampainonton.rusuhbooking

import android.annotation.SuppressLint
import android.content.pm.ApplicationInfo
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@Composable
actual fun PaymentWebView(html: String, onAction: (PaymentAction) -> Unit, modifier: Modifier) {
    val callback by rememberUpdatedState(onAction)
    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                WebView.setWebContentsDebuggingEnabled(context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0)
                settings.javaScriptEnabled = true
                settings.allowFileAccess = false
                settings.allowContentAccess = false
                settings.blockNetworkLoads = true
                settings.javaScriptCanOpenWindowsAutomatically = false
                settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        if (!request.isForMainFrame) return true
                        val url = request.url.toString()
                        if (url.startsWith("rusuhmock://")) {
                            paymentAction("rusuh-mock:" + request.url.host)?.let(callback)
                            return true
                        }
                        return url != "about:blank" && !url.startsWith("https://payment.mock.rusuhtiket.invalid/")
                    }
                }
            }
        },
        update = { view ->
            if (view.tag != html) {
                view.tag = html
                view.loadDataWithBaseURL("https://payment.mock.rusuhtiket.invalid/", html, "text/html", "UTF-8", null)
            }
        },
        onRelease = { it.stopLoading(); it.destroy() },
    )
}

@Composable
actual fun MockBackHandler(enabled: Boolean, onBack: () -> Unit) { BackHandler(enabled, onBack) }
