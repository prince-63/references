package com.dentalstack.doctor.dto.dashboard;

import com.dentalstack.doctor.enums.doctor.DoctorRole;
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
