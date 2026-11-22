package com.expensesplitter.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SplitCalculatorTest {

    private static BigDecimal sum(Map<String, BigDecimal> shares) {
        return shares.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Test
    void equalSplitGivesLeftoverCentsToFirstPeople() {
        var shares = SplitCalculator.equalSplit(new BigDecimal("10.00"), List.of("a", "b", "c"));

        assertThat(shares).containsExactly(
                Map.entry("a", new BigDecimal("3.34")),
                Map.entry("b", new BigDecimal("3.33")),
                Map.entry("c", new BigDecimal("3.33")));
        assertThat(sum(shares)).isEqualByComparingTo("10.00");
    }

    @Test
    void equalSplitAlwaysSumsToTotal() {
        for (int cents = 1; cents <= 1000; cents++) {
            for (int people = 1; people <= 7; people++) {
                List<String> names = java.util.stream.IntStream.range(0, people).mapToObj(i -> "u" + i).toList();
                BigDecimal amount = BigDecimal.valueOf(cents, 2);
                assertThat(sum(SplitCalculator.equalSplit(amount, names))).isEqualByComparingTo(amount);
            }
        }
    }

    @Test
    void equalSplitOfOneCentLeavesOthersAtZero() {
        var shares = SplitCalculator.equalSplit(new BigDecimal("0.01"), List.of("a", "b"));
        assertThat(shares.get("a")).isEqualByComparingTo("0.01");
        assertThat(shares.get("b")).isEqualByComparingTo("0.00");
    }

    @Test
    void equalSplitIgnoresDuplicateNames() {
        var shares = SplitCalculator.equalSplit(new BigDecimal("9.00"), List.of("a", "b", "a"));
        assertThat(shares).hasSize(2);
        assertThat(shares.get("a")).isEqualByComparingTo("4.50");
    }

    @Test
    void equalSplitRequiresSomeone() {
        assertThatThrownBy(() -> SplitCalculator.equalSplit(BigDecimal.TEN, List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void exactSplitAcceptsPartsThatAddUp() {
        Map<String, BigDecimal> parts = new LinkedHashMap<>();
        parts.put("a", new BigDecimal("7.5"));
        parts.put("b", new BigDecimal("2.50"));
        parts.put("c", BigDecimal.ZERO);

        var shares = SplitCalculator.exactSplit(new BigDecimal("10"), parts);

        assertThat(shares).containsOnlyKeys("a", "b"); // zero shares are dropped
        assertThat(shares.get("a")).isEqualTo(new BigDecimal("7.50"));
    }

    @Test
    void exactSplitRejectsMismatchedTotal() {
        assertThatThrownBy(() -> SplitCalculator.exactSplit(new BigDecimal("10.00"),
                Map.of("a", new BigDecimal("4.00"), "b", new BigDecimal("5.00"))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("add up to 9.00");
    }

    @Test
    void exactSplitRejectsNegativeParts() {
        assertThatThrownBy(() -> SplitCalculator.exactSplit(new BigDecimal("1.00"),
                Map.of("a", new BigDecimal("2.00"), "b", new BigDecimal("-1.00"))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsFractionsOfACent() {
        assertThatThrownBy(() -> SplitCalculator.equalSplit(new BigDecimal("1.005"), List.of("a")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
