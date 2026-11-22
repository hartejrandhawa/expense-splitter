package com.expensesplitter.service;

import com.expensesplitter.model.Expense;
import com.expensesplitter.model.ExpenseSplit;
import com.expensesplitter.model.Group;
import com.expensesplitter.model.GroupMember;
import com.expensesplitter.repository.ExpenseRepository;
import com.expensesplitter.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Pure read-side math over a group's expenses: who is up or down overall,
 * and how much the group has actually spent.
 */
@Service
@RequiredArgsConstructor
public class LedgerService {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * @param balances  username -> net (positive = is owed, negative = owes); every member is present,
     *                  in join order, and the values always sum to zero
     * @param totalSpent sum of real expenses, excluding repayments
     */
    public record Ledger(Map<String, BigDecimal> balances, BigDecimal totalSpent) {
        public BigDecimal balanceOf(String username) {
            return balances.getOrDefault(username, BigDecimal.ZERO.setScale(2));
        }
    }

    @Transactional(readOnly = true)
    public Ledger ledgerFor(Group group) {
        Map<String, BigDecimal> net = new LinkedHashMap<>();
        for (GroupMember member : groupMemberRepository.findByGroup(group)) {
            net.put(member.getUser().getUsername(), BigDecimal.ZERO.setScale(2));
        }

        BigDecimal totalSpent = BigDecimal.ZERO.setScale(2);
        List<Expense> expenses = expenseRepository.findByGroupOrderByCreatedAtDesc(group);
        for (Expense expense : expenses) {
            // The payer fronted the whole amount; each participant owes their share of it.
            net.merge(expense.getPaidBy().getUsername(), expense.getAmount(), BigDecimal::add);
            for (ExpenseSplit split : expense.getSplits()) {
                net.merge(split.getUser().getUsername(), split.getAmountOwed().negate(), BigDecimal::add);
            }
            if (!expense.isPayment()) {
                totalSpent = totalSpent.add(expense.getAmount());
            }
        }
        return new Ledger(net, totalSpent);
    }
}
