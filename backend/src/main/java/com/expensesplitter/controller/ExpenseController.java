package com.expensesplitter.controller;

import com.expensesplitter.dto.GroupDtos.AddExpenseRequest;
import com.expensesplitter.dto.GroupDtos.ExpenseResponse;
import com.expensesplitter.dto.GroupDtos.RecordPaymentRequest;
import com.expensesplitter.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/expenses")
    public List<ExpenseResponse> getExpenses(@PathVariable Long groupId, Authentication auth) {
        return expenseService.getGroupExpenses(groupId, auth.getName());
    }

    @PostMapping("/expenses")
    public ResponseEntity<ExpenseResponse> addExpense(@PathVariable Long groupId, Authentication auth,
                                                      @Valid @RequestBody AddExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.addExpense(groupId, auth.getName(), request));
    }

    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long groupId, @PathVariable Long expenseId,
                                              Authentication auth) {
        expenseService.deleteExpense(groupId, auth.getName(), expenseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/payments")
    public ResponseEntity<ExpenseResponse> recordPayment(@PathVariable Long groupId, Authentication auth,
                                                         @Valid @RequestBody RecordPaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.recordPayment(groupId, auth.getName(), request));
    }
}
