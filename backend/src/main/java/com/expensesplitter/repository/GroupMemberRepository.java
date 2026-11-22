package com.expensesplitter.repository;

import com.expensesplitter.model.Group;
import com.expensesplitter.model.GroupMember;
import com.expensesplitter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.group = :group ORDER BY gm.joinedAt, gm.id")
    List<GroupMember> findByGroup(@Param("group") Group group);

    boolean existsByGroupAndUser(Group group, User user);

    boolean existsByGroupIdAndUserUsername(Long groupId, String username);

    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user = :user ORDER BY gm.group.createdAt DESC")
    List<Group> findGroupsByUser(@Param("user") User user);
}
