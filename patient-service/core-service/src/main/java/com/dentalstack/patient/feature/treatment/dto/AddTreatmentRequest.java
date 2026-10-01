package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddTreatmentRequest {
    private long doctorId;
    private long patientId;

    @NotNull
    private ProductTypeName treatmentSubType;

    private TreatmentType treatmentType;
}
