package com.tiketsampainonton.rusuhbooking

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun EventScreen(event: MockEvent, onBack: () -> Unit, onQueue: () -> Unit) {
    AuraBackground(modifier = Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            PageNav(true, onBack = onBack)
            BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
                val compact = maxWidth < 820.dp
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Column(Modifier.widthIn(max = 920.dp).fillMaxWidth().padding(top = 22.dp, bottom = 70.dp), verticalArrangement = Arrangement.spacedBy(22.dp)) {
                        ProgressSteps(0)
                        EventBanner(event, live = true)
                        if (compact) {
                            EventInformation(event)
                            BuyPanel(event, onQueue)
                        } else Row(horizontalArrangement = Arrangement.spacedBy(18.dp), verticalAlignment = Alignment.Top) {
                            EventInformation(event, Modifier.weight(1f))
                            BuyPanel(event, onQueue, Modifier.width(320.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EventInformation(event: MockEvent, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Panel(dark = true) {
            Eyebrow("Tentang event", true)
            Heading("Satu malam, semua panggung.", 20, Color.White)
            Copy("${event.title} kembali ke ${event.venue} dengan line-up lintas genre, tiga panggung, dan pengalaman festival untuk puluhan ribu penonton. Amankan tiketmu lewat antrean resmi yang adil — harga yang kamu lihat adalah harga yang kamu bayar, tanpa biaya tersembunyi.", 14, Color.White.copy(alpha = .62f))
        }
        Panel(dark = true) {
            Eyebrow("Line-up", true)
            Heading("Yang akan tampil.", 20, Color.White)
            listOf("Panggung Utama" to "Senja Kolektif · Rimba · Nadira", "Panggung Senja" to "Jazz Senja · Laut Biru · Teras", "Panggung Neon" to "Garden Beats · Pulsar · Noktah").forEach { (stage, artists) ->
                Column(Modifier.fillMaxWidth().background(Color.White.copy(alpha = .04f), RoundedCornerShape(14.dp)).padding(14.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) { Copy(stage, 13, Color.White, FontWeight.Bold); Copy(artists, 12, Color.White.copy(alpha = .62f)) }
            }
        }
        Panel(dark = true) {
            Eyebrow("Kategori tiket", true)
            Heading("Pilihan tempatmu.", 20, Color.White)
            listOf(Triple("Festival Access", "Area berdiri · general admission", "Rp 325K"), Triple("Golden Circle", "Dekat panggung · zona terbatas", "Rp 550K"), Triple("VIP Deck", "Raised deck · welcome drink", "Rp 950K")).forEachIndexed { index, (name, description, price) ->
                Row(Modifier.fillMaxWidth().border(1.dp, DarkLine, RoundedCornerShape(16.dp)).padding(15.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) { Copy(name, 14, Color.White, FontWeight.Bold); Copy(description, 11, Color.White.copy(alpha = .6f)) }
                    Column(horizontalAlignment = Alignment.End) { Copy(price, 14, Ember, FontWeight.Bold); Copy(listOf("1.248 tersisa", "320 tersisa", "84 tersisa")[index], 10, Color(0xFF4ADE80)) }
                }
            }
            Copy("Kategori & harga final dipilih setelah kamu lolos antrean. Stok di atas bersifat indikatif.", 11, Color.White.copy(alpha = .45f))
        }
        Panel(dark = true) {
            Eyebrow("Lokasi", true)
            Heading("${event.venue}.", 20, Color.White)
            Box(Modifier.fillMaxWidth().height(120.dp).clip(RoundedCornerShape(14.dp)).background(Color.White.copy(alpha = .05f)).border(1.dp, DarkLine, RoundedCornerShape(14.dp)), contentAlignment = Alignment.Center) {
                Canvas(Modifier.matchParentSize()) { var x = -size.height; while (x < size.width) { drawLine(Color.White.copy(alpha = .06f), androidx.compose.ui.geometry.Offset(x, 0f), androidx.compose.ui.geometry.Offset(x + size.height, size.height), 12f); x += 26f } }
                Box(Modifier.size(24.dp).background(Red.copy(alpha = .3f), CircleShape).padding(5.dp).background(Red, CircleShape).border(3.dp, Color.White, CircleShape))
            }
            Copy(event.venue, 14, Color.White, FontWeight.Bold)
            Copy(if (event.city == "Jakarta") "Jl. Pintu Satu Senayan, Jakarta Pusat\nMRT Istora Mandiri · Gate 1–7" else "${event.venue} · ${event.city}", 12, Color.White.copy(alpha = .6f))
        }
    }
}

@Composable
private fun BuyPanel(event: MockEvent, onQueue: () -> Unit, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Panel(dark = true) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) { Copy("Mulai dari", 11, Color.White.copy(alpha = .6f)); Heading("Rp 325K", 28, Color.White) }
            StockBar(.14f, Modifier.fillMaxWidth())
            Copy("Tiket bergerak cepat · 4.920 terjual", 11, Color.White.copy(alpha = .6f))
            listOf("Tanggal" to event.date, "Waktu" to event.time, "Venue" to event.venue, "Batas" to "3 tiket / NIK").chunked(2).forEach { facts -> Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { facts.forEach { (label, value) -> StatTile(value, label.uppercase(), Modifier.weight(1f)) } } }
            Action("Masuk Waiting Room", Modifier.fillMaxWidth(), inverse = true, onClick = onQueue)
            Copy("Semua pembeli masuk lewat waiting room agar antrean tetap adil dan stok tetap akurat.", 11, Color.White.copy(alpha = .45f))
        }
        Panel(dark = true, padding = 16) { listOf("Tiket resmi & terverifikasi", "Antrean adil (FCFS)", "E-ticket langsung ke gate").forEach { Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Canvas(Modifier.size(16.dp)) {
                    val color = Color(0xFF4ADE80)
                    drawLine(color, androidx.compose.ui.geometry.Offset(size.width * .15f, size.height * .5f), androidx.compose.ui.geometry.Offset(size.width * .4f, size.height * .75f), 2.dp.toPx())
                    drawLine(color, androidx.compose.ui.geometry.Offset(size.width * .4f, size.height * .75f), androidx.compose.ui.geometry.Offset(size.width * .85f, size.height * .2f), 2.dp.toPx())
                }
                Copy(it, 12, Color.White.copy(alpha = .62f))
            } } }
    }
}
