package com.tiketsampainonton.rusuhbooking

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.UIKitView
import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.NSURL
import platform.WebKit.*
import platform.darwin.NSObject

private class MockPaymentNavigation(private val onAction: (PaymentAction) -> Unit) : NSObject(), WKNavigationDelegateProtocol {
    override fun webView(webView: WKWebView, decidePolicyForNavigationAction: WKNavigationAction, decisionHandler: (WKNavigationActionPolicy) -> Unit) {
        val url = decidePolicyForNavigationAction.request.URL
        when {
            url?.scheme == "rusuhmock" -> {
                paymentAction("rusuh-mock:" + url.host)?.let(onAction)
                decisionHandler(WKNavigationActionPolicy.WKNavigationActionPolicyCancel)
            }
            url?.absoluteString == "about:blank" || url?.host == "payment.mock.rusuhtiket.invalid" -> decisionHandler(WKNavigationActionPolicy.WKNavigationActionPolicyAllow)
            else -> decisionHandler(WKNavigationActionPolicy.WKNavigationActionPolicyCancel)
        }
    }
}

@OptIn(ExperimentalForeignApi::class)
@Composable
actual fun PaymentWebView(html: String, onAction: (PaymentAction) -> Unit, modifier: Modifier) {
    val callback by rememberUpdatedState(onAction)
    val delegate = remember { MockPaymentNavigation { callback(it) } }
    var loadedHtml by remember { mutableStateOf<String?>(null) }
    UIKitView(
        factory = { WKWebView().apply { navigationDelegate = delegate } },
        modifier = modifier,
        update = { view -> if (loadedHtml != html) { loadedHtml = html; view.loadHTMLString(html, NSURL.URLWithString("https://payment.mock.rusuhtiket.invalid/")) } },
        onRelease = { it.stopLoading(); it.navigationDelegate = null },
    )
}

@Composable
actual fun MockBackHandler(enabled: Boolean, onBack: () -> Unit) = Unit
