package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.SettlementTransaction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

class DebtSimplifierTest {

    private static Map<String, BigDecimal> balances(Object... pairs) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            map.put((String) pairs[i], new BigDecimal((String) pairs[i + 1]));
        }
        return map;
    }

    /** Applying the suggested payments must bring every balance to exactly zero. */
    private static void assertSettlesEveryone(Map<String, BigDecimal> start, List<SettlementTransaction> txns) {
        Map<String, BigDecimal> after = new HashMap<>(start);
        for (var t : txns) {
            assertThat(t.amount()).isPositive();
            assertThat(t.from()).isNotEqualTo(t.to());
            after.merge(t.from(), t.amount(), BigDecimal::add);
            after.merge(t.to(), t.amount().negate(), BigDecimal::add);
        }
        after.values().forEach(v -> assertThat(v).isEqualByComparingTo("0"));
    }

    @Test
    void nothingToSettleWhenEveryoneIsEven() {
        assertThat(DebtSimplifier.simplify(balances("a", "0.00", "b", "0.00"))).isEmpty();
    }

    @Test
    void oneDebtorOneCreditor() {
        var txns = DebtSimplifier.simplify(balances("alice", "25.00", "bob", "-25.00"));
        assertThat(txns).containsExactly(new SettlementTransaction("bob", "alice", new BigDecimal("25.00")));
    }

    @Test
    void chainOfDebtsCollapses() {
        // a owes b 10, b owes c 10  →  a pays c 10 directly
        var start = balances("a", "-10.00", "b", "0.00", "c", "10.00");
        var txns = DebtSimplifier.simplify(start);
        assertThat(txns).containsExactly(new SettlementTransaction("a", "c", new BigDecimal("10.00")));
    }

    @Test
    void fourPersonTripNeedsAtMostThreePayments() {
        var start = balances("ana", "60.00", "ben", "-20.00", "cy", "-15.00", "dee", "-25.00");
        var txns = DebtSimplifier.simplify(start);
        assertThat(txns).hasSize(3);
        assertSettlesEveryone(start, txns);
    }

    @Test
    void randomGroupsAlwaysSettleInAtMostNMinusOnePayments() {
        Random random = new Random(42);
        for (int round = 0; round < 500; round++) {
            int n = 2 + random.nextInt(8);
            Map<String, BigDecimal> start = new HashMap<>();
            long total = 0;
            for (int i = 0; i < n - 1; i++) {
                long cents = random.nextInt(20001) - 10000;
                total += cents;
                start.put("u" + i, BigDecimal.valueOf(cents, 2));
            }
            start.put("u" + (n - 1), BigDecimal.valueOf(-total, 2)); // balances always sum to zero

            var txns = DebtSimplifier.simplify(start);
            assertThat(txns.size()).isLessThanOrEqualTo(n - 1);
            assertSettlesEveryone(start, txns);
        }
    }
}
