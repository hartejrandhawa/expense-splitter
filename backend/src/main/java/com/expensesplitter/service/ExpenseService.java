package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.AddExpenseRequest;
import com.expensesplitter.dto.GroupDtos.ExpenseResponse;
import com.expensesplitter.model.Expense;
import com.expensesplitter.model.ExpenseSplit;
import com.expensesplitter.model.Group;
import com.expensesplitter.model.User;
import com.expensesplitter.repository.ExpenseRepository;
import com.expensesplitter.repository.ExpenseSplitRepository;
import com.expensesplitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;

    @Transactional
    public ExpenseResponse addExpense(Long groupId, String paidByUsername, AddExpenseRequest request) {
        Group group = groupService.getGroupEntity(groupId);
        User paidBy = userRepository.findByUsername(paidByUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Expense expense = new Expense(group, paidBy, request.description(), request.amount());
        expenseRepository.save(expense);

        // Equal split among the specified usernames
        int splitCount = request.splitBetweenUsernames().size();
        BigDecimal share = request.amount()
                .divide(BigDecimal.valueOf(splitCount), 2, RoundingMode.HALF_UP);

        for (String username : request.splitBetweenUsernames()) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
            expenseSplitRepository.save(new ExpenseSplit(expense, user, share));
        }

        return new ExpenseResponse(
                expense.getId(),
                expense.getDescription(),
                expense.getAmount(),
                paidBy.getUsername(),
                expense.getCreatedAt()
        );
    }

    public List<ExpenseResponse> getGroupExpenses(Long groupId) {
        Group group = groupService.getGroupEntity(groupId);
        return expenseRepository.findByGroupOrderByCreatedAtDesc(group).stream()
                .map(e -> new ExpenseResponse(
                        e.getId(),
                        e.getDescription(),
                        e.getAmount(),
                        e.getPaidBy().getUsername(),
                        e.getCreatedAt()
                ))
                .toList();
    }
}
