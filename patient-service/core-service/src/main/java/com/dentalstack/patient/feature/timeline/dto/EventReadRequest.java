package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventReadRequest {
    private NotificationType notificationType;
    private Long profileId;
    private Long organizationId;
    private Long doctorId;
}
