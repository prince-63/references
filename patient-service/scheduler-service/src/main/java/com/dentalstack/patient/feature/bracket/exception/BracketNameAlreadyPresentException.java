package com.dentalstack.patient.feature.bracket.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class BracketNameAlreadyPresentException extends BusinessException {
    public BracketNameAlreadyPresentException(String materialName) {
        super(
                BusinessErrorCode.BRACKET_NAME_ALREADY_PRESENT,
                String.format("Bracket with this name %s already present", materialName));
    }
}
