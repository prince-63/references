package com.dentalstack.patient.feature.workflow.activity.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.activity.dto.ActivityRequest;
import com.dentalstack.patient.feature.workflow.activity.dto.InternalActivityRequest;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import com.dentalstack.patient.feature.workflow.activity.enums.VisibilityScope;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "activity_logs")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private UserProfile activityBy;

    private String activity;

    @Enumerated(EnumType.STRING)
    private ActivityType activityType;

    private ZonedDateTime activityAt;

    private Boolean isCustomActivity;

    @Column(name = "visibility_scope")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VisibilityScope visibilityScope = VisibilityScope.ALL;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "activity_log_visible_to",
            joinColumns = @JoinColumn(name = "activity_log_id"),
            inverseJoinColumns = @JoinColumn(name = "profile_id"))
    @Builder.Default
    private Set<UserProfile> visibleToProfiles = new HashSet<>();

    public static ActivityLog from(Patient patient, UserProfile activityBy, ActivityRequest activityRequest) {
        return ActivityLog.builder()
                .patient(patient)
                .activity(activityRequest.getActivity())
                .activityType(activityRequest.getActivityType())
                .activityBy(activityBy)
                .activityAt(ZonedDateTime.now())
                .isCustomActivity(activityRequest.getIsCustomActivity())
                .visibilityScope(
                        activityRequest.getVisibilityScope() != null
                                ? activityRequest.getVisibilityScope()
                                : VisibilityScope.ALL)
                .visibleToProfiles(
                        activityRequest.getVisibleToProfiles() != null
                                ? activityRequest.getVisibleToProfiles()
                                : new HashSet<>())
                .build();
    }

    public static ActivityLog fromInternal(
            Patient patient, UserProfile activityBy, InternalActivityRequest activityRequest) {
        return ActivityLog.builder()
                .patient(patient)
                .activity(activityRequest.getActivity())
                .activityType(activityRequest.getActivityType())
                .activityBy(activityBy)
                .activityAt(ZonedDateTime.now())
                .isCustomActivity(activityRequest.getIsCustomActivity())
                .visibilityScope(
                        activityRequest.getVisibilityScope() != null
                                ? activityRequest.getVisibilityScope()
                                : VisibilityScope.ALL)
                .visibleToProfiles(
                        activityRequest.getVisibleToProfiles() != null
                                ? activityRequest.getVisibleToProfiles()
                                : new HashSet<>())
                .build();
    }

    public boolean isVisibleTo(UserProfile profile) {
        if (visibilityScope == VisibilityScope.ALL) {
            return true;
        }
        if (visibilityScope == VisibilityScope.CREATOR_ONLY) {
            return activityBy.getId().equals(profile.getId());
        }
        if (visibilityScope == VisibilityScope.SPECIFIC) {
            return visibleToProfiles.stream().anyMatch(p -> p.getId().equals(profile.getId()));
        }
        return false;
    }
}
