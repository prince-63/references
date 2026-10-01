package com.dentalstack.auth.dto;

import com.dentalstack.auth.entity.authstage.AuthStage;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import com.dentalstack.auth.enums.auth.AuthStageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthStageDetails {
    private int srNo;
    private AuthStageType stageType;
    private AuthStageStatus status;

    public static AuthStageDetails from(AuthStage authStage) {
        return new AuthStageDetails(authStage.getSrNo(), authStage.getStageType(), authStage.getStatus());
    }
}
