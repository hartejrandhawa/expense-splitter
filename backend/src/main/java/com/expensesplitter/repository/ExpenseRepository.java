package com.expensesplitter.repository;

import com.expensesplitter.model.Expense;
import com.expensesplitter.model.Group;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Fetch payer and splits in the same query instead of one query per expense (N+1).
    @EntityGraph(attributePaths = {"paidBy", "splits", "splits.user"})
    List<Expense> findByGroupOrderByCreatedAtDesc(Group group);

    Optional<Expense> findByIdAndGroup(Long id, Group group);
}
