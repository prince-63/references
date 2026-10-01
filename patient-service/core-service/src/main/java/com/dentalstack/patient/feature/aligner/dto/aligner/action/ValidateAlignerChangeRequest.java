package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.user.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidateAlignerChangeRequest {

    private long alignerActionId;

    private long validatedBy;

    private UserType validatedByUserType;
    private String remarks;
}
