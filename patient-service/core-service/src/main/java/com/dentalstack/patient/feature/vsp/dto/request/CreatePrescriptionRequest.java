package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.vsp.enums.VspPrescriptionMode;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CreatePrescriptionRequest {

    @NotNull
    private VspPrescriptionMode prescriptionMode;

    private Boolean isSingleJaw = false;
    private Boolean isBiJaw = false;
    private Boolean isUndecided = false;
    private Boolean isGenioplasty = false;
    private Boolean isOthers = false;
    private String othersDescription;
    private String orderId;
    private Long prescriptionId;

    private String treatmentPlan;

    @NotNull
    private LocalDate tentativeSurgeryDate;

    @NotNull
    private LocalDate earliestTreatmentPlanByDate;

    private Long patientId;
}
