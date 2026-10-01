package com.dentalstack.patient.feature.order.dto.v2;

import com.dentalstack.patient.feature.order.enums.OrderType;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CloneOrderRequestV2 {

    private String customerOrderId;
    private JsonNode serviceProducts;

    private Long doctorId;
    private Long profileId;
    private Long organizationId;

    private Long receiverDoctorId;
    private Long receiverOrganizationId;
    private Long receiverProfileId;

    private Long senderProfileId;
    private Long senderDoctorId;
    private Long senderOrganizationId;
    private OrderType orderType;
    private Long serviceProductId;
}
