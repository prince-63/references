package com.dentalstack.patient.feature.tracking.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StlFileToggleRequest {
    private Long profileId;
    private Long customerProfileId;
    private Long organizationId;
    private List<String> toggleType;
}
