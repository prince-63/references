package com.dentalstack.patient.feature.workflow.activity.dto;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import com.dentalstack.patient.feature.workflow.activity.enums.VisibilityScope;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityRequest {

    private Long patientId;

    private String activity;

    private ActivityType activityType;

    private Long activityBy;

    private Boolean isCustomActivity;
    private VisibilityScope visibilityScope;
    private Set<UserProfile> visibleToProfiles;
}
