package com.dentalstack.patient.feature.material.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class MaterialAlreadyPresentException extends BusinessException {
    public MaterialAlreadyPresentException(String materialName) {
        super(
                BusinessErrorCode.MATERIAL_ALREADY_PRESENT,
                String.format("Material with this name %s already present", materialName));
    }

    public MaterialAlreadyPresentException() {
        super(BusinessErrorCode.MATERIAL_ALREADY_PRESENT, "Material with this size already present");
    }
}
