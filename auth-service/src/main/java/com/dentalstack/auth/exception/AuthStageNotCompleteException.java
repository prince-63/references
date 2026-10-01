package com.dentalstack.auth.exception;

import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.entity.authstage.AuthStage;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import java.util.Set;
import java.util.stream.Collectors;

public class AuthStageNotCompleteException extends BusinessException {
    public AuthStageNotCompleteException(Auth auth) {
        super(
                BusinessErrorCode.AUTH_STAGES_NOT_COMPLETE,
                String.format(
                        "Auth stages %s are not complete for %s with email `%s` and mobile no. `%s`",
                        stageStr(auth.getStages()), auth.getUserType(), auth.getEmail(), auth.getMobileNo()));
    }

    private static String stageStr(Set<AuthStage> stages) {
        return stages.stream()
                .filter(stage -> !stage.getStatus().equals(AuthStageStatus.DONE))
                .map(AuthStage::getStageType)
                .map(Enum::name)
                .collect(Collectors.joining(", "));
    }
}
