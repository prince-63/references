package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerPatientListRequest {
    private Long profileId;
    private Long customerId;
    private String search;
    private Integer pageNumber;
    private Integer pageSize;
}
