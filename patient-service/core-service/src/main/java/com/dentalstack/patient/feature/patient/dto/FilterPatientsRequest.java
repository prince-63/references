package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.invitation.enums.FilterBy;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterPatientsRequest {

    private List<String> practiceLocation;

    private List<String> treatments;

    private List<String> services;
    private FilterBy filterBy;
    private Long profileId;
    private Long organizationId;

    @NotNull
    private Long doctorId;
}
