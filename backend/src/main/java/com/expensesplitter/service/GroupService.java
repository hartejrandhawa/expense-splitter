package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.CreateGroupRequest;
import com.expensesplitter.dto.GroupDtos.GroupResponse;
import com.expensesplitter.exception.NotFoundException;
import com.expensesplitter.model.Group;
import com.expensesplitter.model.GroupMember;
import com.expensesplitter.model.User;
import com.expensesplitter.repository.GroupMemberRepository;
import com.expensesplitter.repository.GroupRepository;
import com.expensesplitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final LedgerService ledgerService;

    @Transactional
    public GroupResponse createGroup(String creatorUsername, CreateGroupRequest request) {
        User creator = findUser(creatorUsername);

        // Resolve everyone before saving anything, so a typo doesn't leave a half-created group.
        Set<String> others = new LinkedHashSet<>();
        if (request.memberUsernames() != null) {
            for (String raw : request.memberUsernames()) {
                String username = raw == null ? "" : raw.trim();
                if (!username.isEmpty() && !username.equals(creatorUsername)) others.add(username);
            }
        }
        List<User> members = others.stream().map(this::findUser).toList();

        Group group = groupRepository.save(new Group(request.name().trim(), creator));
        groupMemberRepository.save(new GroupMember(group, creator));
        members.forEach(member -> groupMemberRepository.save(new GroupMember(group, member)));

        return toResponse(group, creatorUsername);
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId, String username) {
        return toResponse(requireMember(groupId, username), username);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(String username) {
        User user = findUser(username);
        return groupMemberRepository.findGroupsByUser(user).stream()
                .map(group -> toResponse(group, username))
                .toList();
    }

    @Transactional
    public GroupResponse addMember(Long groupId, String callerUsername, String newUsername) {
        Group group = requireMember(groupId, callerUsername);
        User user = findUser(newUsername.trim());
        if (groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new IllegalArgumentException(user.getUsername() + " is already in this group");
        }
        groupMemberRepository.save(new GroupMember(group, user));
        return toResponse(group, callerUsername);
    }

    /**
     * Loads a group only if the caller belongs to it. Non-members get the same
     * 404 as a missing group, so group IDs can't be probed to see which exist.
     */
    @Transactional(readOnly = true)
    public Group requireMember(Long groupId, String username) {
        if (!groupMemberRepository.existsByGroupIdAndUserUsername(groupId, username)) {
            throw new NotFoundException("Group not found");
        }
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));
    }

    /** username -> User for every member, in join order. */
    @Transactional(readOnly = true)
    public Map<String, User> membersByUsername(Group group) {
        Map<String, User> members = new LinkedHashMap<>();
        for (GroupMember gm : groupMemberRepository.findByGroup(group)) {
            members.put(gm.getUser().getUsername(), gm.getUser());
        }
        return members;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("No user named \"" + username + "\""));
    }

    private GroupResponse toResponse(Group group, String viewerUsername) {
        LedgerService.Ledger ledger = ledgerService.ledgerFor(group);
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getCreatedBy().getUsername(),
                group.getCreatedAt(),
                List.copyOf(ledger.balances().keySet()),
                ledger.totalSpent(),
                ledger.balanceOf(viewerUsername)
        );
    }
}
