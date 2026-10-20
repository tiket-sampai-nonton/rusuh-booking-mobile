package com.tiketsampainonton.rusuhbooking

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlin.math.ceil

@Composable
fun WaitingScreen(event: MockEvent, position: Int, onHome: () -> Unit, onAdmit: () -> Unit) {
    val progress by animateFloatAsState(1f - position.toFloat() / MockFixtures.queuePosition, tween(650))
    AuraBackground(modifier = Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Row(Modifier.fillMaxWidth()) { Brand(true, onHome) }
            Spacer(Modifier.height(44.dp))
            Pill("●  ${event.title}", dark = true)
            Spacer(Modifier.height(26.dp))
            Panel(Modifier.widthIn(max = 440.dp).fillMaxWidth(), dark = true, padding = 9) {
                Column(Modifier.fillMaxWidth().background(Color.White.copy(alpha = .03f), RoundedCornerShape(21.dp)).padding(horizontal = 22.dp, vertical = 32.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(20.dp)) {
                    Eyebrow("Virtual Waiting Room", true)
                    Box(Modifier.size(200.dp), contentAlignment = Alignment.Center) {
                        Canvas(Modifier.fillMaxSize().padding(8.dp)) {
                            drawArc(Color.White.copy(alpha = .08f), 0f, 360f, false, style = Stroke(9.dp.toPx(), cap = StrokeCap.Round))
                            drawArc(RedGradient, -90f, 360f * progress, false, style = Stroke(9.dp.toPx(), cap = StrokeCap.Round))
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) { Heading(grouped(position), 52, Color.White); Copy(if (position == 0) "GILIRANMU" else "POSISIMU", 10, Color.White.copy(alpha = .6f)) }
                    }
                    Heading(if (position == 0) "Giliranmu sudah tiba!" else "Kamu sedang mengantre", 23, Color.White, align = TextAlign.Center)
                    Copy(if (position == 0) "Slotmu sudah siap. Lanjutkan untuk memilih kategori dan amankan tiketmu." else "Mohon jangan tutup atau refresh berlebihan. Posisimu tersimpan aman di server — refresh pun tidak akan menghapus antreanmu.", 14, Color.White.copy(alpha = .62f), align = TextAlign.Center)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        StatTile(grouped((position - 1).coerceAtLeast(0)), "DI DEPANMU", Modifier.weight(1f))
                        StatTile(if (position == 0) "Siap!" else "~${ceil(position / 1400.0).toInt()} mnt", "ESTIMASI", Modifier.weight(1f))
                        StatTile("1.4k/mnt", "LAJU ANTRE", Modifier.weight(1f))
                    }
                    if (position > 0) Box(Modifier.fillMaxWidth().background(Green.copy(alpha = .1f), RoundedCornerShape(12.dp)).border(1.dp, Green.copy(alpha = .25f), RoundedCornerShape(12.dp)).padding(12.dp)) { Copy("Jangan PHP — begitu giliranmu tiba, kamu dijamin masuk. Tidak akan dipotong di tengah jalan.", 12, Color(0xFF86DFA6), align = TextAlign.Center) }
                    else Action("Giliranmu! Pilih Tiket", Modifier.fillMaxWidth(), inverse = true, onClick = onAdmit)
                }
            }
            Spacer(Modifier.height(20.dp))
            Copy("Antrean First-Come-First-Served. Token antrean diterbitkan & divalidasi server (tidak bisa dipalsukan). Satu slot aktif per akun per event.", 11, Color.White.copy(alpha = .4f), modifier = Modifier.widthIn(max = 440.dp), align = TextAlign.Center)
            Copy("Simulasi antrean untuk pratinjau", 10, Color.White.copy(alpha = .3f), modifier = Modifier.padding(top = 14.dp, bottom = 28.dp))
        }
    }
}

@Composable
fun DetailScreen(event: MockEvent, order: MockOrder, seconds: Int, holding: Boolean, notice: String?, onOrder: (MockOrder) -> Unit, onBack: () -> Unit, onPay: () -> Unit) {
    Column(Modifier.fillMaxSize().background(Paper)) {
        TimerBar(seconds, onBack)
        Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
            Column(Modifier.widthIn(max = 760.dp).fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp).padding(bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                EventBanner(event, height = 240)
                Spacer(Modifier.height(4.dp))
                Eyebrow("Pilih Kategori")
                MockFixtures.tiers.forEach { tier ->
                    val sold = tier.available == 0 || tier.id == "vip" && order.vipSoldOut
                    val selected = order.tier?.id == tier.id
                    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Color.White).border(if (selected) 2.dp else 1.dp, if (selected) Red else LightLine, RoundedCornerShape(20.dp)).clickable(enabled = !sold && !holding) { onOrder(order.select(tier)) }.padding(horizontal = 18.dp, vertical = 20.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(Modifier.size(22.dp).border(2.dp, if (selected) Red else LightLine, CircleShape).padding(5.dp).then(if (selected) Modifier.background(Red, CircleShape) else Modifier))
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                            Copy(tier.name, 15, if (sold) Muted.copy(alpha = .6f) else Ink, FontWeight.ExtraBold)
                            Copy(tier.description, 11, Muted.copy(alpha = if (sold) .5f else 1f))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Copy(if (tier.price == 0) "—" else rupiah(tier.price), 14, if (sold) Muted else Ink, FontWeight.ExtraBold)
                            Copy(if (sold) "Habis" else "Sisa ${grouped(tier.available)}", 11, when { sold -> Muted; tier.available <= 3 -> Red; tier.available < 100 -> Amber; else -> Green }, FontWeight.SemiBold)
                        }
                    }
                }
                Spacer(Modifier.height(6.dp))
                Eyebrow("Jumlah Tiket")
                Row(Modifier.fillMaxWidth().background(Color.White, RoundedCornerShape(18.dp)).border(1.dp, LightLine, RoundedCornerShape(18.dp)).padding(16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) { Copy("Jumlah tiket", 15, weight = FontWeight.Bold); Copy("Maksimal 3 tiket per NIK, per event", 11, Muted) }
                    Row(Modifier.background(Ink.copy(alpha = .04f), CircleShape).padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
                        QuantityButton("−", order.quantity > 1 && !holding, "Kurangi jumlah tiket") { onOrder(order.changeQuantity(order.quantity - 1)) }
                        Copy(order.quantity.toString(), 18, weight = FontWeight.ExtraBold, modifier = Modifier.width(34.dp), align = TextAlign.Center)
                        QuantityButton("+", order.tier != null && order.quantity < minOf(MockFixtures.ticketLimit, order.tier.available) && !holding, "Tambah jumlah tiket") { onOrder(order.changeQuantity(order.quantity + 1)) }
                    }
                }
                Box(Modifier.background(Amber.copy(alpha = .08f), RoundedCornerShape(12.dp)).border(1.dp, Amber.copy(alpha = .2f), RoundedCornerShape(12.dp)).padding(13.dp)) { Copy("!  Batas 3 tiket per NIK berlaku lintas sesi & perangkat — divalidasi server saat hold.", 12, Muted) }
                Spacer(Modifier.height(4.dp))
                Eyebrow("Data Pemesan")
                Panel(padding = 18) {
                    Copy("Nomor Induk Kependudukan (NIK)", 15, weight = FontWeight.Bold)
                    Copy("16 digit sesuai KTP. Wajib diisi untuk melanjutkan.", 12, Muted)
                    OutlinedTextField(order.nik, { onOrder(order.enterNik(it)) }, Modifier.fillMaxWidth(), placeholder = { Copy("3171••••••••••••", 15, Muted) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true, enabled = !holding, shape = RoundedCornerShape(12.dp))
                    if (order.nik.isNotEmpty()) Copy(if (order.nik.length < 16) "NIK harus 16 digit (${order.nik.length}/16)" else "Format NIK valid — kuota dicek server saat Lanjut Bayar", 12, if (order.nik.length == 16) Green else Red, FontWeight.SemiBold)
                }
                if (notice != null) Panel(dark = true, padding = 16) { Copy(notice, 13, Color.White, FontWeight.SemiBold) }
            }
        }
        Box(Modifier.fillMaxWidth().background(Color.White).border(1.dp, LightLine), contentAlignment = Alignment.Center) {
            Row(Modifier.widthIn(max = 760.dp).fillMaxWidth().padding(horizontal = 20.dp, vertical = 16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column { Eyebrow("Total"); Heading(rupiah(order.subtotal), 22) }
                Action(if (holding) "Mengunci stok…" else "Lanjut Bayar", enabled = order.canPay && !holding, onClick = onPay)
            }
        }
    }
}

@Composable
private fun QuantityButton(label: String, enabled: Boolean, description: String, onClick: () -> Unit) {
    Box(Modifier.size(34.dp).clip(CircleShape).background(Color.White).semantics { contentDescription = description }.clickable(enabled = enabled, onClick = onClick), contentAlignment = Alignment.Center) { Copy(label, 21, if (enabled) Ink else Muted.copy(alpha = .3f), FontWeight.Bold) }
}

@Composable
fun ResultScreen(event: MockEvent, order: MockOrder, success: Boolean, onHome: () -> Unit, onRetry: () -> Unit) {
    var downloadInfo by remember { mutableStateOf(false) }
    AuraBackground(success = success, expired = !success, modifier = Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 34.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(20.dp)) {
            Spacer(Modifier.height(14.dp))
            Box(Modifier.size(84.dp).background(if (success) Green else Amber.copy(alpha = .16f), CircleShape).border(1.dp, if (success) Green else Amber.copy(alpha = .4f), CircleShape), contentAlignment = Alignment.Center) {
                Canvas(Modifier.size(42.dp)) {
                    val color = if (success) Color.White else Amber
                    if (success) {
                        drawLine(color, Offset(size.width * .18f, size.height * .52f), Offset(size.width * .43f, size.height * .76f), 5.dp.toPx(), cap = StrokeCap.Round)
                        drawLine(color, Offset(size.width * .43f, size.height * .76f), Offset(size.width * .82f, size.height * .25f), 5.dp.toPx(), cap = StrokeCap.Round)
                    } else {
                        drawCircle(color, size.width * .4f, style = Stroke(3.dp.toPx()))
                        drawLine(color, center, Offset(center.x, size.height * .24f), 3.dp.toPx(), cap = StrokeCap.Round)
                        drawLine(color, center, Offset(size.width * .7f, center.y), 3.dp.toPx(), cap = StrokeCap.Round)
                    }
                }
            }
            Heading(if (success) "Pembayaran Berhasil!" else "Waktu pemesananmu habis", 26, Color.White, align = TextAlign.Center)
            Copy(if (success) "E-tiket sudah dikirim ke emailmu. Tunjukkan QR di bawah saat masuk venue." else "Batas waktu pembayaran terlampaui, jadi tiket yang kamu hold otomatis dilepas kembali agar bisa dibeli orang lain. Tidak ada biaya yang dikenakan.", 14, Color.White.copy(alpha = .6f), modifier = Modifier.widthIn(max = 420.dp), align = TextAlign.Center)
            if (success) {
                Column(Modifier.widthIn(max = 400.dp).fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Color.White)) {
                    Box(Modifier.fillMaxWidth().height(120.dp)) { EventPhoto(event, Modifier.matchParentSize()); Box(Modifier.matchParentSize().background(androidx.compose.ui.graphics.Brush.verticalGradient(listOf(Color.Transparent, Ink.copy(alpha = .8f))))); Copy(event.title, 19, Color.White, FontWeight.ExtraBold, Modifier.align(Alignment.BottomStart).padding(16.dp)) }
                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                        TicketRow("Tanggal", event.date, "Waktu", event.time)
                        TicketRow("Kategori", "${order.tier?.name ?: "Tribun"} × ${order.quantity}", "Venue", event.venue)
                        Canvas(Modifier.fillMaxWidth().height(2.dp)) { var x = 0f; while (x < size.width) { drawLine(Ink.copy(alpha = .18f), Offset(x, 1f), Offset(x + 6.dp.toPx(), 1f), 2.dp.toPx()); x += 12.dp.toPx() } }
                        Box(Modifier.align(Alignment.CenterHorizontally).size(140.dp).border(1.dp, LightLine, RoundedCornerShape(14.dp)).padding(6.dp)) {
                            Canvas(Modifier.fillMaxSize()) { val unit = size.width / 21f; for (x in 0..20) for (y in 0..20) { val finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); val localX = x % 14; val localY = y % 14; val filled = if (finder) localX == 0 || localX == 6 || localY == 0 || localY == 6 || localX in 2..4 && localY in 2..4 else (x * 11 + y * 7 + x * y) % 5 < 2; if (filled) drawRect(Ink, Offset(x * unit, y * unit), androidx.compose.ui.geometry.Size(unit, unit)) } }
                        }
                        Copy("RSH · 2X9F · 7KQ4", 14, Ink, FontWeight.ExtraBold, Modifier.fillMaxWidth(), TextAlign.Center)
                        Copy("TIKET DEMO · TIDAK BERLAKU UNTUK MASUK", 9, Muted, modifier = Modifier.fillMaxWidth(), align = TextAlign.Center)
                    }
                }
                Row(Modifier.widthIn(max = 400.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Action("↓ Unduh E-Tiket", Modifier.weight(1f), inverse = true, arrow = false, onClick = { downloadInfo = true })
                    Action("Ke Beranda", Modifier.weight(1f), inverse = true, ghost = true, arrow = false, onClick = onHome)
                }
                Copy("Email · Dikirim ke r•••••@email.com — cek folder spam bila belum ada", 11, Color.White.copy(alpha = .6f), modifier = Modifier.widthIn(max = 400.dp), align = TextAlign.Center)
            } else {
                Panel(Modifier.widthIn(max = 400.dp).fillMaxWidth(), dark = true, padding = 18) { Copy("Kami mengirim notifikasi \"pemesanan kedaluwarsa\" ke emailmu. Stok sudah dikembalikan ke pool secara otomatis — kamu bisa mencoba lagi dari awal selama tiket masih tersedia.", 13, Color.White.copy(alpha = .6f)) }
                Action("Coba Pesan Lagi", Modifier.widthIn(max = 400.dp).fillMaxWidth(), inverse = true, onClick = onRetry)
                Action("Kembali ke Beranda", Modifier.widthIn(max = 400.dp).fillMaxWidth(), inverse = true, ghost = true, arrow = false, onClick = onHome)
            }
        }
    }
    if (downloadInfo) AlertDialog(onDismissRequest = { downloadInfo = false }, title = { Heading("E-tiket demo", 22) }, text = { Copy("Ini adalah pratinjau desain. Kode tiket dan email di layar ini adalah data simulasi, belum terhubung ke layanan penerbitan tiket.") }, confirmButton = { TextButton(onClick = { downloadInfo = false }) { Text("Mengerti") } })
}

@Composable
private fun TicketRow(leftLabel: String, leftValue: String, rightLabel: String, rightValue: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        Column(Modifier.weight(1f)) { Eyebrow(leftLabel); Copy(leftValue, 13, weight = FontWeight.Bold) }
        Column(Modifier.weight(1f), horizontalAlignment = Alignment.End) { Eyebrow(rightLabel); Copy(rightValue, 13, weight = FontWeight.Bold, align = TextAlign.End) }
    }
}
