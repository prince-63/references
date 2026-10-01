package com.dentalstack.patient.feature.bulkupload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ImportPatientRequest {

    private String spreadSheetId;
    private Long orgProfileId;
    private Long orgId;
}
