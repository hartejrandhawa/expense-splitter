package com.expensesplitter.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class GroupDtos {

    public record CreateGroupRequest(
            @NotBlank @Size(max = 60) String name,
            List<String> memberUsernames // additional members beyond the creator
    ) {}

    public record AddMemberRequest(
            @NotBlank String username
    ) {}

    public record GroupResponse(
            Long id,
            String name,
            String createdBy,
            Instant createdAt,
            List<String> members,
            BigDecimal totalSpent,   // sum of real expenses, excluding repayments
            BigDecimal yourBalance   // caller's net: positive = owed to you, negative = you owe
    ) {}

    /**
     * Provide either splitBetweenUsernames (equal split) or exactSplits
     * (username -> amount, must add up to amount). paidByUsername defaults to the caller.
     */
    public record AddExpenseRequest(
            @NotBlank @Size(max = 120) String description,
            @NotNull @Positive @Digits(integer = 10, fraction = 2) BigDecimal amount,
            String paidByUsername,
            List<String> splitBetweenUsernames,
            Map<String, BigDecimal> exactSplits
    ) {}

    public record RecordPaymentRequest(
            @NotBlank String fromUsername,
            @NotBlank String toUsername,
            @NotNull @Positive @Digits(integer = 10, fraction = 2) BigDecimal amount
    ) {}

    public record SplitShare(
            String username,
            BigDecimal amount
    ) {}

    public record ExpenseResponse(
            Long id,
            String description,
            BigDecimal amount,
            String paidBy,
            Instant createdAt,
            boolean payment,          // true = a repayment between members, not a shared cost
            List<SplitShare> splits
    ) {}

    public record MemberBalance(
            String username,
            BigDecimal balance
    ) {}

    public record SettlementTransaction(
            String from,
            String to,
            BigDecimal amount
    ) {}
}
