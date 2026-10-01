package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspProductionShipping;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspProductionShippingResponse {
    private String id;
    private String trackingNumber;
    private LocalDate tentativeDate;
    private String trackingLink;
    private LocalDate shippingDate;

    public static VspProductionShippingResponse from(VspProductionShipping s) {
        return VspProductionShippingResponse.builder()
                .id(s.getId())
                .trackingNumber(s.getTrackingNumber())
                .tentativeDate(s.getTentativeDate())
                .trackingLink(s.getTrackingLink())
                .shippingDate(s.getShippingDate())
                .build();
    }
}
