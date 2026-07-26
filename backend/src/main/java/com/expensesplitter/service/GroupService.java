package com.expensesplitter.service;

import com.expensesplitter.dto.GroupDtos.CreateGroupRequest;
import com.expensesplitter.dto.GroupDtos.GroupResponse;
import com.expensesplitter.model.Group;
import com.expensesplitter.model.GroupMember;
import com.expensesplitter.model.User;
import com.expensesplitter.repository.GroupMemberRepository;
import com.expensesplitter.repository.GroupRepository;
import com.expensesplitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupResponse createGroup(String creatorUsername, CreateGroupRequest request) {
        User creator = userRepository.findByUsername(creatorUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Group group = new Group(request.name(), creator);
        groupRepository.save(group);

        // creator is automatically a member
        groupMemberRepository.save(new GroupMember(group, creator));

        if (request.memberUsernames() != null) {
            for (String username : request.memberUsernames()) {
                User member = userRepository.findByUsername(username)
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
                if (!groupMemberRepository.existsByGroupAndUser(group, member)) {
                    groupMemberRepository.save(new GroupMember(group, member));
                }
            }
        }

        return toResponse(group);
    }

    public GroupResponse getGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return toResponse(group);
    }

    public List<GroupResponse> getMyGroups(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return groupMemberRepository.findGroupsByUser(user).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<User> getMembers(Group group) {
        return groupMemberRepository.findByGroup(group).stream()
                .map(GroupMember::getUser)
                .toList();
    }

    public Group getGroupEntity(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
    }

    private GroupResponse toResponse(Group group) {
        List<String> memberNames = groupMemberRepository.findByGroup(group).stream()
                .map(m -> m.getUser().getUsername())
                .toList();

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getCreatedBy().getUsername(),
                group.getCreatedAt(),
                memberNames
        );
    }
}
