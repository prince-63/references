package com.dentalstack.patient.feature.flag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlagRequest {
    private Long profileId;
    private Long flagId;
}
