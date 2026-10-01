package com.dentalstack.patient.feature.tracking.dto;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.user.enums.UserType;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetTrackingResponse {

    private Long treatmentPlanId;
    private Long alignerJourneyId;
    private TrackingType trackingType;
    private CurrentAlignerDetails currentAlignerDetails;
    private UserType userType;
    private Boolean askPatientToFill;
    private Boolean sendToPatient;
    private InvitationStatus invitationStatus;
    private BigDecimal pricing;
    private Status status;
    private PatientDataFillStatus patientDataFillStatus;
    private AlignerTreatmentStatus alignerTreatmentStatus;
}
