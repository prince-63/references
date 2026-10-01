package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.product.dto.ProductType;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
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
