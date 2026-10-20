package com.tiketsampainonton.rusuhbooking

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.UIKitView
import kotlinx.cinterop.ExperimentalForeignApi
import platform.Foundation.NSURL
import platform.Foundation.NSURLRequest
import platform.WebKit.WKWebView

@OptIn(ExperimentalForeignApi::class)
@Composable
actual fun PaymentWebView(url: String, modifier: Modifier) {
    UIKitView(
        factory = { WKWebView() },
        modifier = modifier,
        update = { view -> NSURL.URLWithString(url)?.let { view.loadRequest(NSURLRequest(it)) } },
    )
}
