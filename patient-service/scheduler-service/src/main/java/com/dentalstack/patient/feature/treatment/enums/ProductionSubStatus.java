package com.dentalstack.patient.feature.treatment.enums;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ProductionSubStatus implements Serializable {
    UNTRACKED("Aligner not tracked on DS"),
    UNPROCESSED("Unprocessed"),
    IN_PRINTING("In printing"),
    IN_PRODUCTION("In production"),
    IN_TRANSIT("In transit"),
    IN_INVENTORY("In inventory"),
    ISSUED_TO_PATIENT("Issued to the patient"),
    COMPLETED("Patient has already worn and changed these aligner");

    private final String description;
}
