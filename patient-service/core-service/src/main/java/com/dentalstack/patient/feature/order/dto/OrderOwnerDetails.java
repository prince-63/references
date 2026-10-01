package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderOwnerDetails {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String labName;

    public static OrderOwnerDetails from(Order order) {
        var targetProfile = order.getTargetProfile();
        return targetProfile == null
                ? null
                : OrderOwnerDetails.builder()
                        .doctorId(targetProfile.getDoctor().getId())
                        .profileId(targetProfile.getId())
                        .organizationId(targetProfile.getOrganization().getId())
                        .labName(order.getTargetProfileName())
                        .build();
    }
}
