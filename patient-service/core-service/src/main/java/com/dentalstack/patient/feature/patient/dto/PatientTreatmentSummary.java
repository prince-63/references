package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentResponse;
import com.dentalstack.patient.feature.appointment.dto.AllAppointmentsDetails;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.caseinfo.dto.GetCaseInformationRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.payment.dto.payments.TreatmentPaymentsDetails;
import com.dentalstack.patient.feature.storage.files.dto.UserFilesDetails;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import jakarta.annotation.Nullable;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientTreatmentSummary {

    PatientDetails patientDetails;
    AlignerJourneyDetails alignerJourneyDetails;
    AlignerTreatmentResponse alignerTreatmentResponse;
    TreatmentPaymentsDetails treatmentPaymentsDetails;
    BracesJourneyDetails bracesJourneyDetails;
    AllAppointmentsDetails appointmentDetails;
    GetCaseInformationRequest caseInformationRequest;
    UserFilesDetails preTreatmentPhotos;

    public static PatientTreatmentSummary from(
            @Nullable TreatmentPlan treatmentPlan,
            @Nullable GetCaseInformationRequest caseInformationRequest,
            @Nullable BracesJourney bracesJourney,
            Patient patient,
            @Nullable UserFilesDetails preTreatmentPhotos,
            @Nullable Treatment treatment) {

        return PatientTreatmentSummary.builder()
                .alignerJourneyDetails(Optional.ofNullable(treatmentPlan)
                        .map(TreatmentPlan::getTracking)
                        .map(Tracking::getAlignerJourney)
                        .map(AlignerJourneyDetails::from)
                        .orElse(null))
                .patientDetails(PatientDetails.from(patient))
                .alignerTreatmentResponse(Optional.ofNullable(treatmentPlan)
                        .map(AlignerTreatmentResponse::from)
                        .orElse(null))
                .bracesJourneyDetails(Optional.ofNullable(bracesJourney)
                        .map(BracesJourneyDetails::from)
                        .orElse(null))
                .caseInformationRequest(caseInformationRequest)
                .appointmentDetails(Optional.ofNullable(bracesJourney)
                        .map(BracesJourney::getAppointments)
                        .filter(appointments -> !appointments.isEmpty())
                        .map(appointments -> {
                            List<Appointment> activeAppointments = appointments.stream()
                                    .filter(appointment -> appointment.getStatus() == AppointmentStatus.ACTIVE)
                                    .collect(Collectors.toList());
                            return AllAppointmentsDetails.from(activeAppointments);
                        })
                        .orElse(null))
                .preTreatmentPhotos(preTreatmentPhotos)
                .treatmentPaymentsDetails(Optional.ofNullable(treatment)
                        .map(TreatmentPaymentsDetails::from)
                        .orElse(null))
                .build();
    }
}
