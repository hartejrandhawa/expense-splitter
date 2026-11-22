package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.MemberBalance;
import com.expensesplitter.dto.GroupDtos.SettlementTransaction;
import com.expensesplitter.model.Group;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Exposes a group's balances and the simplified "who pays whom" plan. See {@link DebtSimplifier}. */
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final GroupService groupService;
    private final LedgerService ledgerService;

    @Transactional(readOnly = true)
    public List<SettlementTransaction> getSimplifiedSettlement(Long groupId, String callerUsername) {
        Group group = groupService.requireMember(groupId, callerUsername);
        return DebtSimplifier.simplify(ledgerService.ledgerFor(group).balances());
    }

    @Transactional(readOnly = true)
    public List<MemberBalance> getBalances(Long groupId, String callerUsername) {
        Group group = groupService.requireMember(groupId, callerUsername);
        return ledgerService.ledgerFor(group).balances().entrySet().stream()
                .map(e -> new MemberBalance(e.getKey(), e.getValue()))
                .toList();
    }
}
