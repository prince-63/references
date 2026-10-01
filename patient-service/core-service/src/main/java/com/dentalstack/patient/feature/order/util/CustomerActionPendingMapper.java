package com.dentalstack.patient.feature.order.util;

import com.dentalstack.patient.feature.order.dto.OrdersCountResponse;

public final class CustomerActionPendingMapper {

    private CustomerActionPendingMapper() {}

    public record CustomerActionPendingData(
            Long active, Long invited, Long inReview, Long approved, Long stlFilesUploaded) {}

    public static CustomerActionPendingData from(OrdersCountResponse response) {
        if (response == null || response.getGettingStarted() == null) {
            return new CustomerActionPendingData(0L, 0L, 0L, 0L, 0L);
        }

        OrdersCountResponse.GettingStartedDetails gettingStarted = response.getGettingStarted();
        OrdersCountResponse.Count count = response.getCount();

        return new CustomerActionPendingData(
                gettingStarted.getActiveCustomerCount() != null ? gettingStarted.getActiveCustomerCount() : 0L,
                gettingStarted.getInvitedCustomerCount() != null ? gettingStarted.getInvitedCustomerCount() : 0L,
                count != null && count.getInReview() != null ? count.getInReview() : 0L,
                count != null && count.getApproved() != null ? count.getApproved() : 0L,
                count != null && count.getStlFileApproved() != null ? count.getStlFileApproved() : 0L);
    }
}
