package com.dentalstack.patient.feature.gettingstarted.dto;

import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkipGettingStartedRequest {

    private Long profileId;
    private Long organizationId;
    private Long doctorId;
    private GettingStartedEnum gettingStartedEnum;
}
