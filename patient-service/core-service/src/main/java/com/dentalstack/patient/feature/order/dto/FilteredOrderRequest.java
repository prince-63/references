package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.enums.OrderFlow;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilteredOrderRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private int pageNumber;
    private int pageSize;
    private String search;
    private Long patientId;
    private Boolean isOrgAdmin;
    private SortCriteria sortCriteria;
    private OrderStatus filterByStatus;
    private FilterByDueBy filterByDueBy;
    private FilterByAssignedUser filterByAssignedUser;
    private OrderFlow orderFlow;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SortCriteria {
        private String type;
        private String sort;
    }

    public enum FilterByDueBy {
        TODAY,
        OVERDUE,
        NOT_ADDED
    }

    public enum FilterByAssignedUser {
        UNASSIGNED,
        ASSIGNED,
        ASSIGNED_TO_ME;
    }
}
