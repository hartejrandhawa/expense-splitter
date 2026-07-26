package com.expensesplitter.repository;

import com.expensesplitter.model.ExpenseSplit;
import com.expensesplitter.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    @Query("SELECT es FROM ExpenseSplit es WHERE es.expense.group = :group")
    List<ExpenseSplit> findAllByGroup(@Param("group") Group group);
}
