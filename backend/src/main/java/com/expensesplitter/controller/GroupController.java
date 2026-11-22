package com.expensesplitter.controller;

import com.expensesplitter.dto.GroupDtos.AddMemberRequest;
import com.expensesplitter.dto.GroupDtos.CreateGroupRequest;
import com.expensesplitter.dto.GroupDtos.GroupResponse;
import com.expensesplitter.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<GroupResponse> createGroup(Authentication auth, @Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(auth.getName(), request));
    }

    @GetMapping
    public List<GroupResponse> getMyGroups(Authentication auth) {
        return groupService.getMyGroups(auth.getName());
    }

    @GetMapping("/{groupId}")
    public GroupResponse getGroup(@PathVariable Long groupId, Authentication auth) {
        return groupService.getGroup(groupId, auth.getName());
    }

    @PostMapping("/{groupId}/members")
    public GroupResponse addMember(@PathVariable Long groupId, Authentication auth,
                                   @Valid @RequestBody AddMemberRequest request) {
        return groupService.addMember(groupId, auth.getName(), request.username());
    }
}
