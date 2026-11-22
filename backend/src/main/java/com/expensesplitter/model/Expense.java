package com.expensesplitter.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /**
     * A repayment from one member to another. Stored as an expense paid by the
     * sender with a single split owed by the receiver, so balance math needs no
     * special case; the flag only changes how it's displayed and totalled.
     */
    @Column(name = "is_payment", nullable = false, columnDefinition = "boolean default false")
    private boolean payment = false;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseSplit> splits = new ArrayList<>();

    public Expense(Group group, User paidBy, String description, BigDecimal amount) {
        this.group = group;
        this.paidBy = paidBy;
        this.description = description;
        this.amount = amount;
    }
}
