package com.expensesplitter.controller;

import com.expensesplitter.dto.GroupDtos.SettlementTransaction;
import com.expensesplitter.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/settlement")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping
    public ResponseEntity<List<SettlementTransaction>> getSettlement(@PathVariable Long groupId) {
        return ResponseEntity.ok(settlementService.getSimplifiedSettlement(groupId));
    }
}
