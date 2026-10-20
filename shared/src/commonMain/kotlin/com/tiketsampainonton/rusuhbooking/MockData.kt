package com.tiketsampainonton.rusuhbooking

/** Demo fixtures only. Production inventory, limits, queue and deadlines come from the API. */
data class MockEvent(
    val id: String, val title: String, val venue: String, val city: String, val date: String,
    val time: String, val genre: String, val price: Int, val available: Int,
    val badge: String, val status: String,
)

object MockFixtures {
    const val ticketLimit = 3
    const val queuePosition = 8412
    const val detailSeconds = 300
    const val paymentSeconds = 600
    const val serviceFee = 15000
    val featured = listOf(
        MockEvent("pesta", "Pesta Rakyat Fest 2026", "Gelora Bung Karno", "Jakarta", "24 Des 2026", "19:00 WIB", "Festival", 450000, 1248, "Selling Fast", "hot"),
        MockEvent("jazz", "Jazz Senja Nusantara", "Istora Senayan", "Jakarta", "11 Jan 2027", "20:00 WIB", "Jazz", 375000, 320, "Hampir Habis", "low"),
        MockEvent("rock", "Rock In Solidarity", "Stadion GBT", "Surabaya", "2 Feb 2027", "18:30 WIB", "Rock", 525000, 5600, "Tersedia", "ok"),
    )
    val fast = listOf(
        MockEvent("indie", "Indie Night Vol. 9", "Lapangan D Senayan", "Jakarta", "30 Des 2026", "19:00 WIB", "Indie", 280000, 84, "Hampir Habis", "low"),
        MockEvent("symphony", "Symphony Under Stars", "Candi Prambanan", "Yogyakarta", "8 Jan 2027", "19:00 WIB", "Orkestra", 680000, 212, "Selling Fast", "hot"),
        MockEvent("dangdut", "Dangdut Akbar 2026", "JIExpo Kemayoran", "Jakarta", "28 Des 2026", "19:00 WIB", "Dangdut", 0, 0, "Sold Out", "sold"),
    )
    val tiers = listOf(
        MockTier("vip", "VIP Standing", "Area depan panggung + merchandise", 850000, 3),
        MockTier("tribun", "Tribun", "Tempat duduk bernomor", 450000, 48),
        MockTier("festival", "Festival", "Area berdiri umum", 325000, 1240),
        MockTier("box", "Box Premium", "Ruang privat ber-AC", 0, 0),
    )
}

data class MockTier(val id: String, val name: String, val description: String, val price: Int, val available: Int)

data class MockOrder(
    val tier: MockTier? = null, val quantity: Int = 1, val nik: String = "", val vipSoldOut: Boolean = false,
) {
    val subtotal: Int get() = (tier?.price ?: 0) * quantity
    val total: Int get() = subtotal + MockFixtures.serviceFee
    val canPay: Boolean get() = tier != null && tier.available >= quantity && quantity in 1..MockFixtures.ticketLimit && nik.length == 16 && nik.all { it in '0'..'9' } && !(tier.id == "vip" && vipSoldOut)
    fun select(value: MockTier): MockOrder = if (value.available == 0 || value.id == "vip" && vipSoldOut) this else copy(tier = value, quantity = 1)
    fun changeQuantity(value: Int): MockOrder = copy(quantity = value.coerceIn(1, minOf(MockFixtures.ticketLimit, tier?.available ?: 1).coerceAtLeast(1)))
    fun enterNik(value: String): MockOrder = copy(nik = value.filter { it in '0'..'9' }.take(16))
    fun simulateVipContention(): MockOrder = copy(tier = null, quantity = 1, vipSoldOut = true)
}

fun filterEvents(query: String, filter: String): List<MockEvent> = MockFixtures.featured.filter {
    val searchable = "${it.title} ${it.venue} ${it.city} ${it.genre}".lowercase()
    query.trim().lowercase() in searchable && (filter == "Semua" || filter.lowercase() in searchable)
}

fun grouped(value: Int): String = value.toString().reversed().chunked(3).joinToString(".").reversed()
fun rupiah(value: Int): String = "Rp ${grouped(value)}"
fun countdown(seconds: Int): String = "${(seconds.coerceAtLeast(0) / 60).toString().padStart(2, '0')}:${(seconds.coerceAtLeast(0) % 60).toString().padStart(2, '0')}"
enum class MockRoute { Home, Event, Waiting, Detail, Payment, Success, Expired }
enum class PaymentAction { Back, Success, Expired }
fun paymentAction(value: String): PaymentAction? = when (value) {
    "rusuh-mock:back" -> PaymentAction.Back
    "rusuh-mock:success" -> PaymentAction.Success
    "rusuh-mock:expired" -> PaymentAction.Expired
    else -> null
}
