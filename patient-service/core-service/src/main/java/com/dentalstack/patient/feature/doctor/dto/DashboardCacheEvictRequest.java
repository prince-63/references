package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardCacheEvictRequest {
    private List<DoctorRole> roles;
    private Long organizationId;
}
