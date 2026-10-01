package com.dentalstack.patient.feature.workflow.activity.dto;

import com.dentalstack.patient.feature.workflow.activity.entity.ActivityLog;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.TimeStamped;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityResponseDTO implements TimeStamped {
    private Long id;
    private Long patientId;
    private String activity;
    private ActivityType activityType;
    private String activityBy;
    private ZonedDateTime activityAt;
    private Boolean isCustomActivity;

    public static ActivityResponseDTO from(ActivityLog activityLog) {
        return ActivityResponseDTO.builder()
                .id(activityLog.getId())
                .patientId(activityLog.getPatient().getId())
                .activity(activityLog.getActivity())
                .activityType(activityLog.getActivityType() != null ? activityLog.getActivityType() : null)
                .activityBy(
                        activityLog.getActivityBy() != null
                                ? activityLog.getActivityBy().getUser().fullNameWithSalutation()
                                : null)
                .activityAt(activityLog.getActivityAt())
                .isCustomActivity(activityLog.getIsCustomActivity())
                .build();
    }

    @Override
    public ZonedDateTime getTimestamp() {
        return activityAt;
    }
}
