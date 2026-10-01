package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.producttype.dto.producttype.ProductType;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GettingStartedDetails {
    private Boolean caseInfoDetailsFilled;
    private Boolean preTreatmentPhotosFilled;
    private Boolean patientDetailsEdited;
    private Boolean markAllAsRead;
    private Boolean treatmentEnable;
    private Boolean finaliseTrackingEnable;
    private PatientDataFillStatus patientDataFillStatus;
    private Boolean askPatientToFill;
    private AlignerTreatmentStatus treatmentStatus;
    private ProductType productType;
    private Long alignerJourneyId;
    private Status trackingStatus;
    private boolean isBracesNotesAttached;
}
