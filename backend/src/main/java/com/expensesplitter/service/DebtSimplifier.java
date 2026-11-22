package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.SettlementTransaction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

/**
 * Turns net balances into a short list of payments.
 *
 * Greedy strategy: repeatedly match the person owed the most with the person
 * who owes the most, and transfer the smaller of the two amounts. Each step
 * fully settles at least one person, so n people need at most n - 1 payments.
 * That isn't always the true minimum (finding it is NP-hard), but it's close
 * in practice and far fewer than paying back every expense individually.
 */
public final class DebtSimplifier {

    private DebtSimplifier() {}

    private record Balance(String username, BigDecimal amount) {}

    /** @param netBalances positive = is owed money, negative = owes money. Must sum to zero. */
    public static List<SettlementTransaction> simplify(Map<String, BigDecimal> netBalances) {
        // Ties broken by name so the same balances always produce the same suggestions.
        Comparator<Balance> byAmountDesc = Comparator.comparing(Balance::amount).reversed()
                .thenComparing(Balance::username);
        Comparator<Balance> byAmountAsc = Comparator.comparing(Balance::amount)
                .thenComparing(Balance::username);

        PriorityQueue<Balance> creditors = new PriorityQueue<>(byAmountDesc);
        PriorityQueue<Balance> debtors = new PriorityQueue<>(byAmountAsc);

        netBalances.forEach((user, amount) -> {
            if (amount.signum() > 0) creditors.add(new Balance(user, amount));
            else if (amount.signum() < 0) debtors.add(new Balance(user, amount));
        });

        List<SettlementTransaction> transactions = new ArrayList<>();
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            Balance creditor = creditors.poll();
            Balance debtor = debtors.poll();

            BigDecimal amount = creditor.amount().min(debtor.amount().negate());
            transactions.add(new SettlementTransaction(debtor.username(), creditor.username(), amount));

            BigDecimal remainingCredit = creditor.amount().subtract(amount);
            BigDecimal remainingDebt = debtor.amount().add(amount);
            if (remainingCredit.signum() > 0) creditors.add(new Balance(creditor.username(), remainingCredit));
            if (remainingDebt.signum() < 0) debtors.add(new Balance(debtor.username(), remainingDebt));
        }
        return transactions;
    }
}
