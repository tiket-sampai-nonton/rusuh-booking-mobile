package com.tiketsampainonton.rusuhbooking

import kotlin.test.*

class MockDataTest {
    @Test fun searchCombinesTextAndCityFilter() {
        assertEquals(listOf("jazz"), filterEvents("  SENJA ", "Jakarta").map { it.id })
        assertTrue(filterEvents("Senja", "Surabaya").isEmpty())
        assertEquals(listOf("pesta"), filterEvents("", "Festival").map { it.id })
    }
    @Test fun checkoutRequiresCategoryAndExactlySixteenDigits() {
        val tier = MockFixtures.tiers[1]
        assertFalse(MockOrder().canPay)
        assertFalse(MockOrder().select(tier).enterNik("123").canPay)
        assertTrue(MockOrder().select(tier).enterNik("3171 1234 5678 1234").canPay)
        assertEquals("3171123456781234", MockOrder().enterNik("3171a123456781234567").nik)
    }
    @Test fun quantityIsCappedAndSelectionResetsIt() {
        val order = MockOrder().select(MockFixtures.tiers[1]).changeQuantity(9)
        assertEquals(3, order.quantity)
        assertEquals(1350000, order.subtotal)
        assertEquals(1365000, order.total)
        assertEquals(1, order.select(MockFixtures.tiers[2]).quantity)
        assertEquals(1, order.changeQuantity(-1).quantity)
    }
    @Test fun unavailableCategoriesCannotBeSelected() {
        assertNull(MockOrder().select(MockFixtures.tiers.last()).tier)
        val sold = MockOrder().select(MockFixtures.tiers.first()).enterNik("3171123456781234").simulateVipContention()
        assertTrue(sold.vipSoldOut)
        assertNull(sold.tier)
        assertEquals("3171123456781234", sold.nik)
        assertNull(sold.select(MockFixtures.tiers.first()).tier)
        assertTrue(sold.select(MockFixtures.tiers[1]).canPay)
    }
    @Test fun formattingMatchesIndonesianMockCopy() {
        assertEquals("Rp 1.350.000", rupiah(1350000))
        assertEquals("05:00", countdown(300))
        assertEquals("00:09", countdown(9))
        assertEquals("00:00", countdown(-4))
    }
    @Test fun paymentBridgeOnlyAcceptsKnownActions() {
        assertEquals(PaymentAction.Success, paymentAction("rusuh-mock:success"))
        assertEquals(PaymentAction.Back, paymentAction("rusuh-mock:back"))
        assertEquals(PaymentAction.Expired, paymentAction("rusuh-mock:expired"))
        assertNull(paymentAction("success"))
        assertNull(paymentAction("rusuh-mock:javascript:alert(1)"))
    }
    @Test fun paymentUsesSelectedOrderAndEscapesHtml() {
        val template = "__EVENT__|__CATEGORY__|__QTY__|__TOTAL__|__MASKED_NIK__|__REMAINING__"
        val event = MockFixtures.featured.first().copy(title = "<script> & 'event'")
        val order = MockOrder().select(MockFixtures.tiers[1]).changeQuantity(2).enterNik("3171123456781234")
        val result = paymentHtml(template, event, order, -2)
        assertEquals("&lt;script&gt; &amp; &#39;event&#39;|Tribun|2|Rp 915.000|3171••••••••1234|0", result)
    }
}
