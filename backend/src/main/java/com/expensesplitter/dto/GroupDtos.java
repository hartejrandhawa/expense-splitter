package com.expensesplitter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class GroupDtos {

    public record CreateGroupRequest(
            @NotBlank String name,
            List<String> memberUsernames // additional members beyond the creator
    ) {}

    public record GroupResponse(
            Long id,
            String name,
            String createdBy,
            Instant createdAt,
            List<String> members
    ) {}

    public record AddExpenseRequest(
            @NotBlank String description,
            @NotNull @Positive BigDecimal amount,
            @NotEmpty List<String> splitBetweenUsernames // equal split among these usernames
    ) {}

    public record ExpenseResponse(
            Long id,
            String description,
            BigDecimal amount,
            String paidBy,
            Instant createdAt
    ) {}

    public record SettlementTransaction(
            String from,
            String to,
            BigDecimal amount
    ) {}
}
