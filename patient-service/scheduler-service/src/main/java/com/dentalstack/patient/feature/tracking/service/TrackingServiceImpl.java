package com.dentalstack.patient.feature.tracking.service;

import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.event.CreateRefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.events.metadata.event.ResumeTreatmentReminderEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.TreatmentResumedEventMetadata;
import com.dentalstack.patient.feature.events.service.TimelineService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.global.enums.UserType;
import java.time.LocalDate;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class TrackingServiceImpl implements TrackingService {

    private final TrackingRepository trackingRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;

    private final TimelineService timelineService;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    @Override
    public void reminderForPausedTreatment() {
        List<Tracking> allPausedTreatments = trackingRepository.findAllPausedTreatments();
        LocalDate today = LocalDate.now();

        for (Tracking treatment : allPausedTreatments) {
            if (treatment.getResumeDate() != null && treatment.getResumeDate().equals(today)) {
                if (treatment.getAlignerJourney() != null) {
                    timelineService.addEvent(
                            treatment.getPatientId(),
                            UserType.PATIENT,
                            treatment.getAlignerJourney().getDoctorId(),
                            UserType.DOCTOR,
                            EventType.RESUME_TREATMENT_REMINDER,
                            new ResumeTreatmentReminderEventMetadata(
                                    treatment.getPatientId(),
                                    treatment.getAlignerJourney().getId()));
                    var alignerJourney = treatment.getAlignerJourney();
                    var patient = patientRepository
                            .findById(treatment.getPatientId())
                            .orElseThrow(() -> new PatientNotFoundException(treatment.getPatientId()));
                    var doctor = doctorService.getDoctor(patient.getAddedByUserId());
                    notificationService.notificationForResumePausedTreatment(patient, doctor, alignerJourney.getId());
                }
            }
        }
    }

    @Override
    public void reminderForResumeTreatment() {
        List<Tracking> allActiveTreatments = trackingRepository.findAllActiveTreatments();
        LocalDate today = LocalDate.now();

        for (Tracking tracking : allActiveTreatments) {
            LocalDate resumeDate = tracking.getResumeDate();
            if (resumeDate != null && resumeDate.equals(today)) {
                tracking.setPatientTrackingStatus(PatientTrackingStatus.RESUME);
                AlignerJourney alignerJourney = tracking.getAlignerJourney();
                if (alignerJourney != null) {
                    timelineService.addEvent(
                            alignerJourney.getDoctorId(),
                            UserType.DOCTOR,
                            alignerJourney.getPatient().getId(),
                            UserType.PATIENT,
                            EventType.TREATMENT_RESUMED,
                            new TreatmentResumedEventMetadata(AlignerJourneyDetails.from(alignerJourney)));

                    var doctorId = alignerJourney.getDoctorId();
                    var doctor = doctorService.getDoctor(doctorId);
                    var optionalPatient = patientRepository.findById(tracking.getPatientId());
                    if (!tracking.getTrackingType().equals(TrackingType.MANUAL)) {
                        optionalPatient.ifPresent(patient -> notificationService.resumeAlignerJourneyNotification(
                                doctor.getFirstName(), patient, doctor.isDrToDisplay()));
                    }
                    trackingRepository.save(tracking);
                }
            }
        }
    }

    @Override
    public void refinementReminder() {
        LocalDate elevenDaysAgo = LocalDate.now().minusDays(11);
        LocalDate tenDaysAgo = LocalDate.now().minusDays(10);
        log.info("Checking for treatments deactivated between: {} and {}", elevenDaysAgo, tenDaysAgo);

        long totalEligible = 0;

        List<TreatmentPlan> latestTreatmentPlans = treatmentPlanRepository.findLatestTreatmentPlanForAllPatients();

        log.info("Processing {} latest treatment plans", latestTreatmentPlans.size());

        for (TreatmentPlan treatmentPlan : latestTreatmentPlans) {
            Long patientId = treatmentPlan.getPatient().getId();

            log.info(
                    "Processing latest treatment plan ID: {} for patient ID: {}. Status: {}, DeactivatedAt: {}, CreatedAt: {}",
                    treatmentPlan.getId(),
                    patientId,
                    treatmentPlan.getStatus(),
                    treatmentPlan.getDeactivatedAt(),
                    treatmentPlan.getCreatedAt());

            if (treatmentPlan.getStatus() == AlignerTreatmentStatus.DEACTIVATED
                    && treatmentPlan.getDeactivatedAt() != null
                    && treatmentPlan.getDeactivatedAt().isBefore(tenDaysAgo)
                    && !treatmentPlan.getDeactivatedAt().isBefore(elevenDaysAgo)) {

                timelineService.addEvent(
                        patientId,
                        UserType.PATIENT,
                        treatmentPlan.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.CREATE_REFINEMENT_REMINDER,
                        new CreateRefinementTreatmentEventMetaData(patientId));

                var patient = treatmentPlan.getPatient();
                var doctor = doctorService.getDoctor(patient.getAddedByUserId());
                notificationService.notificationForRefinementReminder(patient, doctor);

                log.info("Sent reminder for patient ID: {}", patientId);
                totalEligible++;
            }
        }

        log.info("Finished processing. Total eligible patients for reminders: {}", totalEligible);
    }
}
