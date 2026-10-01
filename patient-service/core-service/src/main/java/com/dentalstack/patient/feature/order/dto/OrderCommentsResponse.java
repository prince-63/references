package com.dentalstack.patient.feature.order.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderCommentsResponse {
    private String orderId;
    private Long doctorId;
    private Long profileId;
    private String notes;
    private String profileImageUrl;
    private String displayName;
    private ZonedDateTime createdAt;
    private String remark;
    private Long taskId;
}
