package com.dentalstack.patient.feature.chat.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(
        name = "case_team",
        indexes = {
            @Index(name = "IX_case_team_created_by", columnList = "created_by_profile_id"),
            @Index(name = "IX_case_team_name", columnList = "team_name")
        })
@Getter
@Setter
@ToString(exclude = {"createdBy", "members", "chats"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseTeam extends BaseEntity {

    @NotNull
    @Column(name = "team_name", nullable = false)
    private String teamName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_profile_id", nullable = false)
    private UserProfile createdBy;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "case_team_member",
            joinColumns = @JoinColumn(name = "case_team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_profile_id"),
            indexes = {
                @Index(name = "IX_case_team_member_team", columnList = "case_team_id"),
                @Index(name = "IX_case_team_member_profile", columnList = "user_profile_id")
            })
    private Set<UserProfile> members = new HashSet<>();

    @Builder.Default
    @ManyToMany(mappedBy = "caseTeams", fetch = FetchType.LAZY)
    private Set<DoctorChat> chats = new HashSet<>();

    @Column(name = "member_count")
    @Builder.Default
    private Integer memberCount = 0;
}
