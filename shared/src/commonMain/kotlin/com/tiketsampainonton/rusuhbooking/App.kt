package com.tiketsampainonton.rusuhbooking

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

private sealed interface Screen {
    data object Home : Screen
    data object WaitingRoom : Screen
    data object TicketDetail : Screen
    data object Payment : Screen
}

@Composable
fun App() {
    var screen by remember { mutableStateOf<Screen>(Screen.Home) }
    MaterialTheme {
        when (screen) {
            Screen.Home -> ScreenContent("Rusuh Booking", "Find your event") { screen = Screen.WaitingRoom }
            Screen.WaitingRoom -> ScreenContent("Waiting Room", "Queue data will come from the server") { screen = Screen.TicketDetail }
            Screen.TicketDetail -> ScreenContent("Ticket Detail", "Ticket availability will come from the server") { screen = Screen.Payment }
            Screen.Payment -> PaymentScreen(onBack = { screen = Screen.TicketDetail })
        }
    }
}

@Composable
private fun ScreenContent(title: String, description: String, onNext: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(title, style = MaterialTheme.typography.headlineMedium)
        Text(description)
        Button(onClick = onNext) { Text("Continue") }
    }
}

@Composable
private fun PaymentScreen(onBack: () -> Unit) {
    // A booking-specific server URL will replace this placeholder when API integration lands.
    Column(Modifier.fillMaxSize()) {
        Button(onClick = onBack) { Text("Back") }
        PaymentWebView(url = "about:blank", modifier = Modifier.fillMaxSize())
    }
}

@Composable
expect fun PaymentWebView(url: String, modifier: Modifier = Modifier)
