package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateToCancelledOrNeedMoreInfoRequest {

    @NotNull
    private String orderId;

    @NotNull
    private OrderStatus orderStatus;

    @Nullable
    private Boolean isNeedMoreInfoUpdated;

    @Nullable
    private NeedMoreInfo needMoreInfo;

    @Nullable
    private CancelOrder cancelOrder;

    private Boolean isNewOrder;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NeedMoreInfo {
        private String remark;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelOrder {
        private String remark;
    }
}
