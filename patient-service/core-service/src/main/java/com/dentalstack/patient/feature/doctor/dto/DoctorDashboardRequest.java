package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.subcription.enums.PlanName;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDashboardRequest {

    private long doctorId;
    private long organizationId;
    private long profileId;
    private List<DoctorRole> roles;
    private PlanName planName;
}
