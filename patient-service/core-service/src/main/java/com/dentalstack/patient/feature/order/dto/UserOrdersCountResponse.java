package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserOrdersCountResponse {
    private String userName;
    private long userProfileId;
    private int customerActionPendingCount;
    private int userActionPendingCount;
    private int ongoingOrderCount;
}
