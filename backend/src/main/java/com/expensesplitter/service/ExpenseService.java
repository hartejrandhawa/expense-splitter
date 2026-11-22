package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.AddExpenseRequest;
import com.expensesplitter.dto.GroupDtos.ExpenseResponse;
import com.expensesplitter.dto.GroupDtos.RecordPaymentRequest;
import com.expensesplitter.dto.GroupDtos.SplitShare;
import com.expensesplitter.exception.ForbiddenException;
import com.expensesplitter.exception.NotFoundException;
import com.expensesplitter.model.Expense;
import com.expensesplitter.model.ExpenseSplit;
import com.expensesplitter.model.Group;
import com.expensesplitter.model.User;
import com.expensesplitter.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupService groupService;

    @Transactional
    public ExpenseResponse addExpense(Long groupId, String callerUsername, AddExpenseRequest request) {
        Group group = groupService.requireMember(groupId, callerUsername);
        Map<String, User> members = groupService.membersByUsername(group);

        String payerName = isBlank(request.paidByUsername()) ? callerUsername : request.paidByUsername().trim();
        User payer = requireInGroup(members, payerName);

        BigDecimal amount = SplitCalculator.fromCents(SplitCalculator.toCents(request.amount()));
        boolean exact = request.exactSplits() != null && !request.exactSplits().isEmpty();
        Map<String, BigDecimal> shares = exact
                ? SplitCalculator.exactSplit(amount, request.exactSplits())
                : SplitCalculator.equalSplit(amount, request.splitBetweenUsernames());

        Expense expense = new Expense(group, payer, request.description().trim(), amount);
        shares.forEach((username, share) ->
                expense.getSplits().add(new ExpenseSplit(expense, requireInGroup(members, username), share)));

        return toResponse(expenseRepository.save(expense));
    }

    /**
     * A repayment is modelled as an expense the sender "paid" that only the
     * receiver owes. That raises the sender's balance and lowers the receiver's
     * by the same amount, exactly what settling a debt should do.
     */
    @Transactional
    public ExpenseResponse recordPayment(Long groupId, String callerUsername, RecordPaymentRequest request) {
        Group group = groupService.requireMember(groupId, callerUsername);
        Map<String, User> members = groupService.membersByUsername(group);

        User from = requireInGroup(members, request.fromUsername().trim());
        User to = requireInGroup(members, request.toUsername().trim());
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Someone can't pay themselves");
        }

        BigDecimal amount = SplitCalculator.fromCents(SplitCalculator.toCents(request.amount()));
        Expense payment = new Expense(group, from, "Payment", amount);
        payment.setPayment(true);
        payment.getSplits().add(new ExpenseSplit(payment, to, amount));

        return toResponse(expenseRepository.save(payment));
    }

    @Transactional
    public void deleteExpense(Long groupId, String callerUsername, Long expenseId) {
        Group group = groupService.requireMember(groupId, callerUsername);
        Expense expense = expenseRepository.findByIdAndGroup(expenseId, group)
                .orElseThrow(() -> new NotFoundException("Expense not found"));

        boolean isPayer = expense.getPaidBy().getUsername().equals(callerUsername);
        boolean isGroupCreator = group.getCreatedBy().getUsername().equals(callerUsername);
        boolean isPaymentRecipient = expense.isPayment() && expense.getSplits().stream()
                .anyMatch(s -> s.getUser().getUsername().equals(callerUsername));

        if (!isPayer && !isGroupCreator && !isPaymentRecipient) {
            throw new ForbiddenException("Only the person who paid or the group creator can delete this");
        }
        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getGroupExpenses(Long groupId, String callerUsername) {
        Group group = groupService.requireMember(groupId, callerUsername);
        return expenseRepository.findByGroupOrderByCreatedAtDesc(group).stream()
                .map(this::toResponse)
                .toList();
    }

    private User requireInGroup(Map<String, User> members, String username) {
        User user = members.get(username);
        if (user == null) {
            throw new IllegalArgumentException(username + " isn't a member of this group");
        }
        return user;
    }

    private ExpenseResponse toResponse(Expense e) {
        List<SplitShare> splits = e.getSplits().stream()
                .map(s -> new SplitShare(s.getUser().getUsername(), s.getAmountOwed()))
                .sorted(Comparator.comparing(SplitShare::username))
                .toList();
        return new ExpenseResponse(
                e.getId(),
                e.getDescription(),
                e.getAmount(),
                e.getPaidBy().getUsername(),
                e.getCreatedAt(),
                e.isPayment(),
                splits
        );
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
