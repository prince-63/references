package com.dentalstack.patient.feature.treatment.service.impl;

import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.service.TreatmentPlanService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TreatmentPlanServiceImpl implements TreatmentPlanService {

    private final BracesJourneyRepository bracesJourneyRepository;
    private final DoctorService doctorService;
    private final InvitationRepository invitationRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;

    @Override
    public TreatmentPlan getPlan(Long doctorId, String productType) {
        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);

        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);
        DoctorDetails doctorDetails = doctorService.getDoctor(doctorId);
        int patientCount = invitations.size();
        Long practiceLocationCount = doctorService.getPracticeLocationCount(doctorId);
        long treatmentCount = 0L;
        long treatmentPlanCount = 0L;
        long appointmentCount = 0L;
        for (Invitation invitation : invitations) {
            assert invitation.getPatientInvitation() != null;
            var patientId = invitation.getPatientInvitation().getPatient().getId();
            var patient = invitation.getPatientInvitation().getPatient();
            Optional<BracesJourney> currentPatientBracesJourney =
                    bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                            patientId, BracesTreatmentStage.ACTIVE);
            var alignerJourneyList = alignerJourneyRepository.findByPatientId(patientId);

            if (patient.getProductTypeNames().contains(ProductTypeName.UNASSIGNED)) {
                treatmentCount += 1;
            }
            if (alignerJourneyList.isEmpty()) {
                if (currentPatientBracesJourney.isEmpty()) {
                    treatmentPlanCount += 1;
                    appointmentCount += 1;
                } else {
                    List<Appointment> appointments =
                            currentPatientBracesJourney.get().getAppointments();
                    if (appointments == null || appointments.isEmpty()) {
                        appointmentCount += 1;
                    } else {
                        for (Appointment appointment : appointments) {
                            if (appointment.getStatus().equals(AppointmentStatus.DRAFT)) {
                                appointmentCount += 1;
                            }
                        }
                    }
                }
            }
        }
        return TreatmentPlan.builder()
                .doctorFirstName(doctorDetails.getFirstName())
                .doctorLastName(doctorDetails.getLastName())
                .patientCount(patientCount)
                .practiceLocationCount(practiceLocationCount)
                .userNotAssignedToTreatmentPlanCount(treatmentPlanCount)
                .userNotAssignedToAppointmentCount(appointmentCount)
                .userNotAssignedToTreatmentCount(treatmentCount)
                .build();
    }
}
