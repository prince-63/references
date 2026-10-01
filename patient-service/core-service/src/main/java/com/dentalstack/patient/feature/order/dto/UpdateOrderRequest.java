package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateOrderRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String orderId;
    private OrderStatus status;
    private AssignedUserDetails assignedUserDetails;
    private LocalDate dueBy;

    @Nullable
    private Boolean isNewOrder;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AssignedUserDetails {
        private Long assignedUserProfileId;
        private String assignedUserName;
    }

    private Long treatmentPlanId;
}
