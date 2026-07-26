package com.expensesplitter.controller;

import com.expensesplitter.dto.GroupDtos.CreateGroupRequest;
import com.expensesplitter.dto.GroupDtos.GroupResponse;
import com.expensesplitter.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            Authentication auth,
            @Valid @RequestBody CreateGroupRequest request
    ) {
        return ResponseEntity.ok(groupService.createGroup(auth.getName(), request));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroup(groupId));
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getMyGroups(Authentication auth) {
        return ResponseEntity.ok(groupService.getMyGroups(auth.getName()));
    }
}
