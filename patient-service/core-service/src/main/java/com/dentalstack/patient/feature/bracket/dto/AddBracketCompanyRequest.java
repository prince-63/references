package com.dentalstack.patient.feature.bracket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddBracketCompanyRequest {

    private Long bracketSubTypeId;

    private long doctorId;

    private String bracketCompanyName;
}
