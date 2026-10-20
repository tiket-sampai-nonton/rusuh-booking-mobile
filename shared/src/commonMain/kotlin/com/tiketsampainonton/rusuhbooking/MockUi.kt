package com.tiketsampainonton.rusuhbooking

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import com.tiketsampainonton.rusuhbooking.resources.*
import org.jetbrains.compose.resources.*

val Ink = Color(0xFF0A0A0C)
val Paper = Color(0xFFFBFBFD)
val Red = Color(0xFFEC1C24)
val Ember = Color(0xFFFF5A2D)
val Muted = Color(0xFF6B6B76)
val Green = Color(0xFF17A34A)
val Amber = Color(0xFFE8830C)
val LightLine = Ink.copy(alpha = .09f)
val DarkLine = Color.White.copy(alpha = .1f)
val RedGradient = Brush.linearGradient(listOf(Ember, Red))

@Composable
fun MockTheme(content: @Composable () -> Unit) {
    val font = FontFamily(
        Font(Res.font.jakarta_regular, FontWeight.Normal),
        Font(Res.font.jakarta_medium, FontWeight.Medium),
        Font(Res.font.jakarta_semibold, FontWeight.SemiBold),
        Font(Res.font.jakarta_bold, FontWeight.Bold),
        Font(Res.font.jakarta_extrabold, FontWeight.ExtraBold),
    )
    val base = Typography()
    fun TextStyle.jakarta() = copy(fontFamily = font)
    MaterialTheme(
        colorScheme = lightColorScheme(primary = Red, background = Paper, surface = Color.White, onSurface = Ink, onBackground = Ink),
        typography = Typography(
            displayLarge = base.displayLarge.jakarta(), displayMedium = base.displayMedium.jakarta(), displaySmall = base.displaySmall.jakarta(),
            headlineLarge = base.headlineLarge.jakarta(), headlineMedium = base.headlineMedium.jakarta(), headlineSmall = base.headlineSmall.jakarta(),
            titleLarge = base.titleLarge.jakarta(), titleMedium = base.titleMedium.jakarta(), titleSmall = base.titleSmall.jakarta(),
            bodyLarge = base.bodyLarge.jakarta(), bodyMedium = base.bodyMedium.jakarta(), bodySmall = base.bodySmall.jakarta(),
            labelLarge = base.labelLarge.jakarta(), labelMedium = base.labelMedium.jakarta(), labelSmall = base.labelSmall.jakarta(),
        ), content = content,
    )
}

@Composable
fun Copy(text: String, size: Int = 14, color: Color = Ink, weight: FontWeight = FontWeight.Normal, modifier: Modifier = Modifier, align: TextAlign? = null) {
    Text(text, modifier, color = color, fontSize = size.sp, fontWeight = weight, lineHeight = (size * 1.5).sp, textAlign = align)
}

@Composable
fun Heading(text: String, size: Int = 26, color: Color = Ink, modifier: Modifier = Modifier, align: TextAlign? = null) {
    Text(text, modifier, color = color, fontSize = size.sp, fontWeight = FontWeight.ExtraBold, lineHeight = (size * 1.08).sp, letterSpacing = (-size * .025).sp, textAlign = align)
}

@Composable
fun Eyebrow(text: String, dark: Boolean = false, color: Color = if (dark) Color.White.copy(alpha = .6f) else Muted) {
    Text(text.uppercase(), color = color, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
}

@Composable
fun Brand(dark: Boolean = false, onClick: () -> Unit = {}) {
    Row(Modifier.clip(CircleShape).clickable(onClick = onClick).padding(4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp)) {
        Box(Modifier.size(24.dp).background(RedGradient, RoundedCornerShape(7.dp)), contentAlignment = Alignment.Center) { Copy("▶", 12, Color.White) }
        Copy("Rusuh Tiket", 15, if (dark) Color.White else Ink, FontWeight.ExtraBold)
    }
}

@Composable
fun Action(text: String, modifier: Modifier = Modifier, inverse: Boolean = false, ghost: Boolean = false, enabled: Boolean = true, arrow: Boolean = true, onClick: () -> Unit) {
    val bg = when { ghost -> if (inverse) Color.White.copy(alpha = .07f) else Color.Transparent; inverse -> Color.White; else -> Ink }
    val fg = if (inverse && !ghost || !inverse && ghost) Ink else Color.White
    Row(
        modifier.clip(CircleShape).background(bg.copy(alpha = if (enabled) bg.alpha else .35f))
            .border(1.dp, if (ghost) (if (inverse) Color.White.copy(alpha = .2f) else LightLine) else Color.Transparent, CircleShape)
            .clickable(enabled = enabled, onClick = onClick).padding(start = 22.dp, end = if (arrow) 10.dp else 22.dp, top = 12.dp, bottom = 12.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center,
    ) {
        Copy(text, 14, fg.copy(alpha = if (enabled) 1f else .5f), FontWeight.Bold)
        if (arrow) { Spacer(Modifier.width(12.dp)); Box(Modifier.size(32.dp).background(Red, CircleShape), contentAlignment = Alignment.Center) { Copy("↗", 18, Color.White) } }
    }
}

@Composable
fun Pill(text: String, color: Color = Red, dark: Boolean = false, modifier: Modifier = Modifier) {
    Box(modifier.background(if (dark) Color.White.copy(alpha = .1f) else color.copy(alpha = .08f), CircleShape).border(1.dp, if (dark) Color.White.copy(alpha = .18f) else color.copy(alpha = .18f), CircleShape).padding(horizontal = 13.dp, vertical = 7.dp)) {
        Copy(text, 10, if (dark) Color.White else color, FontWeight.Bold)
    }
}

@Composable
fun Panel(modifier: Modifier = Modifier, dark: Boolean = false, padding: Int = 22, content: @Composable ColumnScope.() -> Unit) {
    Column(modifier.background(if (dark) Color.White.copy(alpha = .04f) else Color.White, RoundedCornerShape(22.dp)).border(1.dp, if (dark) DarkLine else LightLine, RoundedCornerShape(22.dp)).padding(padding.dp), verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
}

@Composable
fun EventPhoto(event: MockEvent, modifier: Modifier = Modifier, hero: Boolean = false) {
    val resource = when (event.id) { "jazz" -> if (hero) Res.drawable.jazz_hero else Res.drawable.jazz; "rock" -> Res.drawable.rock; "indie" -> Res.drawable.indie; "symphony" -> Res.drawable.symphony; "dangdut" -> Res.drawable.dangdut; else -> Res.drawable.pesta }
    Image(painterResource(resource), event.title, modifier, contentScale = ContentScale.Crop)
}

@Composable
fun AuraBackground(success: Boolean = false, expired: Boolean = false, modifier: Modifier = Modifier, content: @Composable BoxScope.() -> Unit) {
    Box(modifier.background(Ink)) {
        Canvas(Modifier.matchParentSize()) {
            drawRect(Brush.radialGradient(listOf((if (success) Green else if (expired) Amber else Red).copy(alpha = .22f), Color.Transparent), center = Offset(size.width * .25f, size.height * .25f), radius = size.maxDimension * .65f))
            drawRect(Brush.radialGradient(listOf(Ember.copy(alpha = .13f), Color.Transparent), center = Offset(size.width * .82f, size.height * .78f), radius = size.maxDimension * .55f))
        }
        content()
    }
}

@Composable
fun StockBar(fraction: Float, modifier: Modifier = Modifier) {
    Box(modifier.height(6.dp).clip(CircleShape).background(Color.White.copy(alpha = .14f))) {
        Box(Modifier.fillMaxHeight().fillMaxWidth(fraction.coerceIn(0f, 1f)).background(RedGradient))
    }
}

@Composable
fun PageNav(dark: Boolean = false, backText: String = "← Beranda", onBack: () -> Unit) {
    Row(Modifier.fillMaxWidth().background(if (dark) Ink.copy(alpha = .9f) else Paper).border(1.dp, if (dark) DarkLine else LightLine).padding(horizontal = 20.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Brand(dark, onBack)
        TextButton(onClick = onBack) { Copy(backText, 13, if (dark) Color.White.copy(alpha = .6f) else Muted, FontWeight.SemiBold) }
    }
}

@Composable
fun TimerBar(seconds: Int, onBack: () -> Unit) {
    Box(Modifier.fillMaxWidth().background(Paper).border(1.dp, LightLine), contentAlignment = Alignment.Center) {
        Row(Modifier.widthIn(max = 760.dp).fillMaxWidth().padding(horizontal = 20.dp, vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Copy("← Kembali", 14, Muted, FontWeight.SemiBold) }
            Pill("●  ${countdown(seconds)}", Red)
        }
    }
}

@Composable
fun ProgressSteps(active: Int) {
    Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
        listOf("Detail", "Antre", "Pilih", "Bayar").forEachIndexed { i, label ->
            val color = if (i == active) Ember else Color.White.copy(alpha = .4f)
            Box(Modifier.size(23.dp).border(1.dp, color, CircleShape), contentAlignment = Alignment.Center) { Copy(i.toString(), 10, color) }
            Copy(label.uppercase(), 10, color)
            if (i < 3) Box(Modifier.width(20.dp).height(1.dp).background(color.copy(alpha = .4f)))
        }
    }
}

@Composable
fun EventBanner(event: MockEvent, modifier: Modifier = Modifier, height: Int = 300, live: Boolean = false) {
    Box(modifier.fillMaxWidth().height(height.dp).clip(RoundedCornerShape(24.dp))) {
        EventPhoto(event, Modifier.matchParentSize(), hero = true)
        Box(Modifier.matchParentSize().background(Brush.verticalGradient(listOf(Color.Transparent, Ink.copy(alpha = .92f)))))
        Column(Modifier.align(Alignment.BottomStart).padding(22.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            if (live) Pill("●  LIVE · ${event.badge}", dark = true)
            Heading(event.title, if (height > 230) 36 else 26, Color.White)
            Copy("${event.venue} · ${event.date} · ${event.time}", 12, Color.White.copy(alpha = .82f))
            if (live) FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { listOf(event.genre, "18+", "Durasi 5 jam", "Gate 17:00").forEach { Pill(it, dark = true) } }
        }
    }
}
