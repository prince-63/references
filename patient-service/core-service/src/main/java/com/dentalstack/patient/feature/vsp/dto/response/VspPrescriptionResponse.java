package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspPrescription;
import com.dentalstack.patient.feature.vsp.enums.VspPrescriptionMode;
import com.dentalstack.patient.feature.vsp.enums.VspPrescriptionStatus;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspPrescriptionResponse {
    private Long id;
    private String orderId;
    private VspPrescriptionMode prescriptionMode;

    private Boolean isSingleJaw;
    private Boolean isBiJaw;
    private Boolean isUndecided;
    private Boolean isGenioplasty;
    private Boolean isOthers;
    private String othersDescription;

    private String treatmentPlan;
    private LocalDate tentativeSurgeryDate;
    private LocalDate earliestTreatmentPlanByDate;

    private VspPrescriptionStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static VspPrescriptionResponse from(VspPrescription p) {
        return VspPrescriptionResponse.builder()
                .id(p.getId())
                .orderId(p.getVspOrder() != null ? p.getVspOrder().getId() : null)
                .prescriptionMode(p.getPrescriptionMode())
                .isSingleJaw(p.getIsSingleJaw())
                .isBiJaw(p.getIsBiJaw())
                .isUndecided(p.getIsUndecided())
                .isGenioplasty(p.getIsGenioplasty())
                .isOthers(p.getIsOthers())
                .othersDescription(p.getOthersDescription())
                .treatmentPlan(p.getTreatmentPlan())
                .tentativeSurgeryDate(p.getTentativeSurgeryDate())
                .earliestTreatmentPlanByDate(p.getEarliestTreatmentPlanByDate())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
