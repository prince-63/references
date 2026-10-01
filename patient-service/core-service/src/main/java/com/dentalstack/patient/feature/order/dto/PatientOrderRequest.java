package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientOrderRequest {

    private Long doctorId;
    private Long profileId;
    private String search;
    private Long patientId;
    private Long customerProfileId;
    private Integer page;
    private Integer size;
    private FilteredOrderRequest.SortCriteria sortCriteria;
    private OrderStatus filterByStatus;
    private FilteredOrderRequest.FilterByDueBy filterByDueBy;
    private FilteredOrderRequest.FilterByAssignedUser filterByAssignedUser;
}
