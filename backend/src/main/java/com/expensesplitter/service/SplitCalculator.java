package com.expensesplitter.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Splits money in whole cents so the shares always add back up to the total.
 * Rounding every share (e.g. $10 / 3 = 3.33 each) silently loses a cent,
 * which then shows up as a phantom balance nobody can settle.
 */
public final class SplitCalculator {

    private SplitCalculator() {}

    /**
     * Equal split: everyone gets floor(total / n) cents, and the leftover
     * cents go one each to the first participants in the given order.
     * $10.00 between 3 → 3.34, 3.33, 3.33.
     */
    public static Map<String, BigDecimal> equalSplit(BigDecimal amount, List<String> usernames) {
        if (usernames == null || usernames.isEmpty()) {
            throw new IllegalArgumentException("Pick at least one person to split with");
        }
        List<String> unique = usernames.stream().distinct().toList();
        long totalCents = toCents(amount);
        int n = unique.size();
        long base = totalCents / n;
        long remainder = totalCents % n;

        Map<String, BigDecimal> shares = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            long cents = base + (i < remainder ? 1 : 0);
            shares.put(unique.get(i), fromCents(cents));
        }
        return shares;
    }

    /** Exact split: validates the parts and returns them normalised to 2 decimal places. */
    public static Map<String, BigDecimal> exactSplit(BigDecimal amount, Map<String, BigDecimal> parts) {
        if (parts == null || parts.isEmpty()) {
            throw new IllegalArgumentException("Pick at least one person to split with");
        }
        Map<String, BigDecimal> shares = new LinkedHashMap<>();
        long sum = 0;
        for (var entry : parts.entrySet()) {
            BigDecimal part = entry.getValue();
            if (part == null || part.signum() < 0) {
                throw new IllegalArgumentException("Split amounts can't be negative");
            }
            if (part.signum() == 0) continue; // a zero share is the same as not being in the split
            long cents = toCents(part);
            sum += cents;
            shares.put(entry.getKey(), fromCents(cents));
        }
        if (shares.isEmpty()) {
            throw new IllegalArgumentException("Pick at least one person to split with");
        }
        if (sum != toCents(amount)) {
            throw new IllegalArgumentException(
                    "Split amounts add up to " + fromCents(sum) + " but the expense is " + fromCents(toCents(amount)));
        }
        return shares;
    }

    static long toCents(BigDecimal amount) {
        if (amount.scale() > 2 && amount.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException("Amounts can't have more than 2 decimal places");
        }
        return amount.setScale(2, RoundingMode.UNNECESSARY).movePointRight(2).longValueExact();
    }

    static BigDecimal fromCents(long cents) {
        return BigDecimal.valueOf(cents, 2);
    }
}
