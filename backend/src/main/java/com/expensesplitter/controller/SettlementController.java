package com.expensesplitter.controller;

import com.expensesplitter.dto.GroupDtos.MemberBalance;
import com.expensesplitter.dto.GroupDtos.SettlementTransaction;
import com.expensesplitter.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/settlement")
    public List<SettlementTransaction> getSettlement(@PathVariable Long groupId, Authentication auth) {
        return settlementService.getSimplifiedSettlement(groupId, auth.getName());
    }

    @GetMapping("/balances")
    public List<MemberBalance> getBalances(@PathVariable Long groupId, Authentication auth) {
        return settlementService.getBalances(groupId, auth.getName());
    }
}
