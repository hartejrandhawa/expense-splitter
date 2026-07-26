package com.expensesplitter.controller;

import com.expensesplitter.dto.GroupDtos.AddExpenseRequest;
import com.expensesplitter.dto.GroupDtos.ExpenseResponse;
import com.expensesplitter.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @PathVariable Long groupId,
            Authentication auth,
            @Valid @RequestBody AddExpenseRequest request
    ) {
        return ResponseEntity.ok(expenseService.addExpense(groupId, auth.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getGroupExpenses(groupId));
    }
}
