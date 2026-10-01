package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private DoctorRole role;
}
