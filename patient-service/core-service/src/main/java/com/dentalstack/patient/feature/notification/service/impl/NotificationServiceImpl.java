package com.dentalstack.patient.feature.notification.service.impl;

import static com.dentalstack.patient.feature.notification.enums.ComplianceNotificationCycle.*;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.UpdateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.calendar.enums.CalendarResponseTypes;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.enums.ComplianceNotificationCycle;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.entity.*;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.calendar.CalendarEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentStartingTomorrowEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.UpcomingAlignerChangeEventMetaData;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.enums.language.Language;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.*;
import java.util.function.BiConsumer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final ChatService chatService;
    private final DoctorService doctorService;
    private final DoctorRepository doctorRepository;
    private final TimelineService timelineService;
    private final MessageSource messageSource;
    private final PatientRepository patientRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final WhatsAppUtilities whatsAppUtilities;
    private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;
    private final XOrganizationNameResolver xOrgNameResolver;

    @Override
    public void alignerJourneyPaused(
            String displayName, AlignerJourney alignerJourney, Patient patient, boolean isDrToDisplay) {

        Locale locale = getPatientLocale(patient);

        String titleKey = "notification.treatment.paused.title";
        String messageKey = "notification.treatment.paused";

        String title = messageSource.getMessage(titleKey, null, locale);
        String message = messageSource.getMessage(messageKey, new Object[] {displayName}, locale);
        var tracking = alignerJourney.getTracking();
        if (tracking != null && !tracking.getTrackingType().equals(TrackingType.MANUAL)) {
            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(2)
                    .mobile(alignerJourney.getPatient().getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        }
    }

    @Override
    public void notificationForAlignerAckByDoctor(
            Patient patient, AlignerJourney alignerJourney, boolean isDrToDisplay, String displayName) {
        try {
            var tracking = alignerJourney.getTracking();
            if (tracking != null && !tracking.getTrackingType().equals(TrackingType.MANUAL)) {
                chatService.sendNotification(SendNotificationRequest.builder()
                        .title("Aligner change reviewed!")
                        .message(String.format("%s has reviewed your Aligner Change", displayName))
                        .notificationIndex(21)
                        .mobile(patient.getMobileNo())
                        .email(patient.getEmail())
                        .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                        .organizationId(
                                xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                        .build());
            }
        } catch (Exception e) {
            log.warn(
                    "Failed to notify about aligner validation feedback added by the doctor with id {}",
                    alignerJourney.getDoctorId());
        }
    }

    @Override
    public void notificationForMissedAlignerChange(AlignerJourney alignerJourney) {
        try {
            var today = LocalDate.now();
            var currentAligner = alignerJourney.getCurrentAligner();
            if (currentAligner == null || currentAligner.getEndDate() == null) return;

            var nextAlignerNo = currentAligner.getSrNo() + 1;

            if (nextAlignerNo <= alignerJourney.totalAligners() && today.isAfter(currentAligner.getEndDate())) {
                var patient = alignerJourney.getPatient();
                Locale locale = getPatientLocale(patient);

                String title =
                        getLocalizedMessage("notification.aligner.missed.title", new Object[] {nextAlignerNo}, locale);
                String message = getLocalizedMessage("notification.aligner.missed.message", null, locale);

                chatService.sendNotification(SendNotificationRequest.builder()
                        .title(title)
                        .message(message)
                        .mobile(patient.getMobileNo())
                        .notificationIndex(22)
                        .email(patient.getEmail())
                        .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                        .organizationId(
                                xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                        .build());

                chatService.sendNotification(SendNotificationRequest.builder()
                        .title("Missed aligner change")
                        .message("Missed changing to Aligner" + " " + currentAligner.getSrNo())
                        .mobile(patient.getMobileNo())
                        .notificationIndex(22)
                        .email(patient.getEmail())
                        .isDoctorApp(true)
                        .patientId(patient.getId())
                        .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                        .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                        .organizationId(
                                xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                        .build());
            }

        } catch (Exception e) {
            log.error("Error in notificationForMissedAlignerChange: ", e);
        }
    }

    @Override
    public void notificationForTreatmentStartingToday(AlignerJourney alignerJourney) {
        var startDate = alignerJourney.getDoctorTreatmentStartDate();
        if (startDate == null || !startDate.equals(LocalDate.now())) {
            return;
        }

        var patient = alignerJourney.getPatient();

        Locale locale = getPatientLocale(patient);

        String title = getLocalizedMessage("notification.treatment.start.title", null, locale);
        String message = getLocalizedMessage("notification.treatment.start.message", null, locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .mobile(patient.getMobileNo())
                .notificationIndex(80)
                .email(patient.getEmail())
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
        var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

        var patientOptional = patientRepository.findByIdWithDoctorProfileDetails(patient.getId());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Treatment starting today")
                .message(String.format(
                        "%s is beginning their treatment today",
                        alignerJourney.getPatient().getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(82)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(alignerJourney.getPatient().getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(
                        alignerJourney.getPatient().getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (patientOptional.isPresent()) {
            var userProfileId = patientOptional
                    .get()
                    .getDoctorOrganization()
                    .getUserProfile()
                    .getId();

            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(userProfileId);

            numbers.forEach(no -> {
                String url = "profile/" + alignerJourney.getPatient().getId() + "/aligner-tracking";
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getTREATMENT_STARTING_TODAY(),
                                List.of(alignerJourney.getPatient().fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForFillAlignerMissingDetails(Patient patient, DoctorDetails doctor) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Treatment information updated")
                .message(String.format(
                        "%s has filled in their treatment stage information. Tap to view.", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(83)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForAlignerFeedbackAddedByPatient(
            DoctorDetails doctor, Patient patient, Long alignerJourneyId, Long alignerActionId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("New patient reply")
                .message(String.format("%s has added comments on Aligner check-in.", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(84)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .alignerActionId(alignerActionId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForResumePausedTreatment(
            Patient patient, DoctorDetails doctor, Long alignerJourneyId, OrgWhatsAppDetails orgWhatsAppDetails) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Time to resume treatment")
                .message(String.format(
                        "%s's treatment is set to resume. Please review and update their progress in the app.",
                        patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(86)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForAlignerChangeScheduled(
            Patient patient, DoctorDetails doctor, int x, int y, Long alignerJourneyId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Scheduled Aligner change")
                .message(String.format(
                        "%s has been moved from Aligner %d to Aligner %d as scheduled. Tap here to review and update any changes.",
                        patient.getFirstName(), x, y))
                .mobile(doctor.getMobile())
                .notificationIndex(87)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForRefinementReminder(Patient patient, DoctorDetails doctor) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Reminder to create a new plan")
                .message(String.format(
                        "It's been 10 days since deactivating %s's last plan. Please set up a new plan.",
                        patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(88)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForAlignerChange(
            UserProfile userProfile,
            Patient patient,
            DoctorDetails doctor,
            int x,
            int y,
            Long alignerJourneyId,
            Long alignerActionId,
            Long delayInDays) {

        String delayLabel = "";
        if (delayInDays > 0) {
            delayLabel = " (Delayed by " + delayInDays + (delayInDays == 1 ? " day)" : " days)");
        }

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Aligner changed")
                .message(String.format(
                        "%s has changed their aligner from %d to %d.%s", patient.getFirstName(), x, y, delayLabel))
                .mobile(doctor.getMobile())
                .notificationIndex(90)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .alignerJourneyId(alignerJourneyId)
                .alignerActionId(alignerActionId)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                patient.getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.ADMIN));
        OrgName orgName = whatsAppUtilities.resolveOrgName(userProfile.getId());

        String url = "profile/" + patient.getId() + "/aligner-tracking";
        numbers.forEach(no -> {
            whatsAppRequestBuilder
                    .buildRequestIfMobileExists(
                            true,
                            orgName,
                            no,
                            whatsappTemplateTypeProperties.getALIGNER_CHANGE_FROM_APP(),
                            List.of(patient.fullName(), url))
                    .ifPresent(chatService::sendWhatsAppMessage);
        });
    }

    @Override
    public void notificationForIssueReported(
            DoctorDetails doctor,
            Patient patient,
            Long alignerJourneyId,
            Long alignerActionId,
            UserProfile userProfile) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Issue reported ⚠")
                .message(String.format("%s has reported an issue. Tap to review.", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(91)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .alignerActionId(alignerActionId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                patient.getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.ADMIN));
        OrgName orgName = whatsAppUtilities.resolveOrgName(userProfile.getId());

        numbers.forEach(no -> {
            String url = "profile/" + patient.getId() + "/aligner-tracking";
            whatsAppRequestBuilder
                    .buildRequestIfMobileExists(
                            true,
                            orgName,
                            no,
                            whatsappTemplateTypeProperties.getREPORTED_ISSUE(),
                            List.of(patient.fullName(), url))
                    .ifPresent(chatService::sendWhatsAppMessage);
        });
    }

    @Override
    public void notificationForCriticalCheckIn(
            DoctorDetails doctor,
            Patient patient,
            Long alignerJourneyId,
            Long alignerActionId,
            Long profileId,
            Long doctorId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("New aligner check-in for review")
                .message(String.format("%s has submitted an aligner check-in form for review", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(92)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .alignerActionId(alignerActionId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                patient.getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.ADMIN));
        OrgName orgName = whatsAppUtilities.resolveOrgName(profileId);

        numbers.forEach(no -> {
            String url = "profile/" + patient.getId() + "/aligner-tracking";
            whatsAppRequestBuilder
                    .buildRequestIfMobileExists(
                            true,
                            orgName,
                            no,
                            whatsappTemplateTypeProperties.getALIGNER_CHECKIN(),
                            List.of(patient.fullName(), url))
                    .ifPresent(chatService::sendWhatsAppMessage);
        });
    }

    @Override
    public void commentAddedOnOrderTreatment(
            String orgName, Patient patient, String orderId, String email, String mobile, Long profileId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("New comment")
                .message(String.format("New comments have been added to %s case.", patient.getFirstName()))
                .mobile(mobile)
                .notificationIndex(125)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForNormalCheckIn(
            DoctorDetails doctor,
            Patient patient,
            Long alignerJourneyId,
            Long alignerActionId,
            Long profileId,
            String mobile,
            Long doctorId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Aligner check-in")
                .message(String.format("%s has submitted an aligner check-in form.", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(93)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .alignerActionId(alignerActionId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                patient.getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.ADMIN));
        OrgName orgName = whatsAppUtilities.resolveOrgName(profileId);

        numbers.forEach(no -> {
            String url = "profile/" + patient.getId() + "/aligner-tracking";
            whatsAppRequestBuilder
                    .buildRequestIfMobileExists(
                            true,
                            orgName,
                            no,
                            whatsappTemplateTypeProperties.getALIGNER_CHECKIN(),
                            List.of(patient.fullName(), url))
                    .ifPresent(chatService::sendWhatsAppMessage);
        });
    }

    @Override
    public void notificationForPhotosUploadedByPatient(DoctorDetails doctor, Patient patient) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("New files added")
                .message(String.format("%s has added new files", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(94)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void askPatientToFillMissingAlignerDetailsNotification(
            String doctorName, Patient patient, boolean isDrToDisplay) {
        try {
            Locale locale = getPatientLocale(patient);

            String title = getLocalizedMessage("notification.treatment.missing.details.title", null, locale);
            String message = getLocalizedMessage(
                    "notification.treatment.missing.details.message", new Object[] {doctorName}, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(70)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send missing aligner details notification for email {}", patient.getEmail(), e);
        }
    }

    private String getLocalizedMessage(String key, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (NoSuchMessageException e) {
            return messageSource.getMessage(key, args, Locale.ENGLISH);
        }
    }

    @Override
    public void sendNotificationOfInvite(String doctorName, Patient patient, boolean isDrToDisplay) {
        Locale locale = getPatientLocale(patient);

        String titleKey = "notification.invite.title";
        String messageKey = "notification.invite.message";

        String title = getLocalizedMessage(titleKey, null, locale);
        String message = getLocalizedMessage(messageKey, new Object[] {doctorName}, locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(5)
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .isDoctorApp(false)
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForCancelledInvite(
            String doctorName,
            String mobileNo,
            String email,
            boolean isDrToDisplay,
            String xOrgName,
            Long organizationId) {
        chatService.sendNotification(SendNotificationRequest.from(
                String.format("%s has rejected your invitation. Tap to invite another doctor", doctorName),
                mobileNo,
                "Invitation Declined!",
                6,
                email,
                xOrgName,
                organizationId));
    }

    @Override
    public void notificationForAcceptedInvite(
            String patientName, String mobileNo, String email, Long patientId, Long profileId) {
        String xOrgName = xOrgNameResolver.resolveFromPatientId(patientId).getXOrgName();
        Long organizationId = xOrgNameResolver.resolveFromPatientId(patientId).getOrganizationId();
        chatService.sendNotification(SendNotificationRequest.from(
                String.format("%s is now connected with you.", patientName),
                mobileNo,
                "Patient connected",
                7,
                email,
                true,
                patientId,
                xOrgName,
                organizationId));

        List<String> mobileNumbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                patientId, List.of(MessageSendTo.ADMIN, MessageSendTo.CUSTOMER));
        OrgName orgName = whatsAppUtilities.resolveOrgName(profileId);
        String url = "profile/" + patientId;
        mobileNumbers.forEach(no -> {
            whatsAppRequestBuilder
                    .buildRequestIfMobileExists(
                            true,
                            orgName,
                            no,
                            whatsappTemplateTypeProperties.getPATIENT_CONNECTED(),
                            List.of(
                                    patientName,
                                    orgName.name().replace("_", " ").toLowerCase(),
                                    url))
                    .ifPresent(chatService::sendWhatsAppMessage);
        });
    }

    @Override
    public void treatmentPlanApproved(Patient patient, String doctorEmail, String mobile) {

        Locale locale = getPatientLocale(patient);

        String titleKey = "notification.treatment.approved.title";
        String messageKey = "notification.treatment.approved";

        String title = messageSource.getMessage(titleKey, null, locale);
        String message = messageSource.getMessage(messageKey, new Object[] {patient.getFirstName()}, locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(110)
                .mobile(mobile)
                .email(doctorEmail)
                .patientId(patient.getId())
                .isDoctorApp(true)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForAlignerChangeReminder(AlignerJourney alignerJourney, SendNotificationRequest request) {
        Locale locale = getPatientLocale(alignerJourney.getPatient());

        var tracking = alignerJourney.getTracking();
        if (tracking != null && !tracking.getTrackingType().equals(TrackingType.MANUAL)) {
            String title = messageSource.getMessage("notification.aligner.wear.title", null, locale);
            String message;

            if ("It's time to wear your aligners! Remember to put them on and start tracking."
                    .equalsIgnoreCase(request.getMessage())) {
                message = messageSource.getMessage("notification.aligner.wear.message.start", null, locale);
            } else if ("It’s time to put your Aligners back on!".equalsIgnoreCase(request.getMessage())) {
                message = messageSource.getMessage("notification.aligner.wear.message.continue", null, locale);
            } else {
                message = request.getMessage();
            }

            log.info("Sending push notification for aligner change reminder to mobile no {}", request.getMobile());

            SendNotificationRequest localizedRequest = SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(request.getNotificationIndex())
                    .email(request.getEmail())
                    .mobile(request.getMobile())
                    .xOrgName(xOrgNameResolver
                            .resolveFromPatient(alignerJourney.getPatient())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromPatient(alignerJourney.getPatient())
                            .getOrganizationId())
                    .build();

            chatService.sendNotification(localizedRequest);
        }
    }

    private Locale getPatientLocale(Patient patient) {
        return Optional.ofNullable(patient)
                .map(Patient::getLanguage)
                .map(Language::getLocale)
                .orElse(DEFAULT_LOCALE);
    }

    @Override
    public void notificationForCompliance(AlignerJourney alignerJourney) {
        final Patient patient = alignerJourney.getPatient();
        var currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null) return;

        Compliance compliance = currentAligner.compliance();
        if (compliance == null) return;

        long fourthJourney = Math.ceilDiv(currentAligner.totalDaysToWear(), 4);
        long noOfDaysWorn = currentAligner.noOfDaysWorn(false, true, false);
        if (noOfDaysWorn == fourthJourney) {

            notificationForCompliance(patient, compliance, TWENTY_FIVE_PERCENT_COMPLETE);
        } else if (noOfDaysWorn == 2 * fourthJourney) {

            notificationForCompliance(patient, compliance, FIFTY_PERCENT_COMPLETE);
        } else if (currentAligner.dayRemaining() == 2) {

            notificationForCompliance(patient, compliance, TWO_DAYS_REMAINING);
        }
    }

    @Override
    public void notificationForCompliance(
            Patient patient, Compliance compliance, ComplianceNotificationCycle complianceNotificationCycle) {

        Locale locale = getPatientLocale(patient);

        String titleKey = null;
        String messageKey = null;

        switch (compliance) {
            case POOR, AVERAGE -> {
                switch (complianceNotificationCycle) {
                    case TWENTY_FIVE_PERCENT_COMPLETE -> {
                        titleKey = "notification.compliance.title.consistency";
                        messageKey =
                                "notification.compliance." + compliance.name().toLowerCase() + ".25percent";
                    }
                    case FIFTY_PERCENT_COMPLETE -> {
                        titleKey = "notification.compliance.title.recommit";
                        messageKey =
                                "notification.compliance." + compliance.name().toLowerCase() + ".50percent";
                    }
                    case TWO_DAYS_REMAINING -> {
                        titleKey = "notification.compliance.title.boost";
                        messageKey =
                                "notification.compliance." + compliance.name().toLowerCase() + ".2days";
                    }
                }
            }
            case GOOD -> {
                return;
            }
        }

        if (titleKey == null) return;

        String title = getLocalizedMessage(titleKey, null, locale);
        String message = getLocalizedMessage(messageKey, null, locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .message(message)
                .title(title)
                .notificationIndex(15)
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForDailyGoalComplete(Patient patient) {
        Locale locale = getPatientLocale(patient);

        String title = getLocalizedMessage("notification.daily.goal.title", null, locale);
        String message = getLocalizedMessage("notification.daily.goal.message", null, locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(16)
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForAlignerFeedbackAddedByDoctor(
            Patient patient, AlignerJourney alignerJourney, boolean isDrToDisplay, String displayName) {
        try {
            Locale locale = getPatientLocale(patient);

            var tracking = alignerJourney.getTracking();
            if (tracking != null && !tracking.getTrackingType().equals(TrackingType.MANUAL)) {
                String title = getLocalizedMessage("notification.aligner.feedback.title", null, locale);
                String message = getLocalizedMessage(
                        "notification.aligner.feedback.message", new Object[] {displayName}, locale);

                chatService.sendNotification(SendNotificationRequest.builder()
                        .title(title)
                        .message(message)
                        .notificationIndex(21)
                        .mobile(patient.getMobileNo())
                        .email(patient.getEmail())
                        .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                        .organizationId(
                                xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                        .build());
            }
        } catch (Exception e) {
            log.warn(
                    "Failed to notify about aligner feedback added by the doctor with id {}",
                    alignerJourney.getAligners());
        }
    }

    @Override
    public void notificationForAlignerJourneyUpdates(
            String displayName,
            UpdateAlignerJourneyRequest.UpdateDetails updateDetails,
            Patient patient,
            boolean isDrToDisplay) {
        Locale locale = getPatientLocale(patient);

        var currentAlignerWearDaysUpdated = updateDetails.isCurrentAlignerWearDaysUpdated();
        var subsequentAlignersWearDaysUpdated = updateDetails.isSubsequentAlignersWearDaysUpdated();

        String messageKey = null;
        boolean sendNotification = true;

        if (currentAlignerWearDaysUpdated && subsequentAlignersWearDaysUpdated) {
            messageKey = "notification.wear.days.modified.current.upcoming";
        } else if (currentAlignerWearDaysUpdated) {
            messageKey = "notification.wear.days.modified.current";
        } else if (subsequentAlignersWearDaysUpdated) {
            messageKey = "notification.wear.days.modified.upcoming";
        } else {

            sendNotification = false;
        }

        if (sendNotification) {
            String title = getLocalizedMessage("notification.wear.days.modified.title", null, locale);
            String message = getLocalizedMessage(messageKey, new Object[] {displayName}, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .mobile(patient.getMobileNo())
                    .notificationIndex(23)
                    .email(patient.getEmail())
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        }
    }

    @Override
    public void currentWearDaysUpdateNotification(
            String displayName,
            Patient patient,
            AlignerJourney alignerJourney,
            int indexNumber,
            boolean isDrToDisplay) {
        Locale locale = getPatientLocale(patient);

        String title = getLocalizedMessage("notification.wear.days.modified.title", null, locale);
        String message =
                getLocalizedMessage("notification.wear.days.modified.current", new Object[] {displayName}, locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(indexNumber)
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .isDoctorApp(false)
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void wearDaysUpdateNotification(
            String displayName,
            Patient patient,
            Boolean isCurrentAligner,
            AlignerJourney alignerJourney,
            int indexNo,
            boolean isDrToDisplay) {
        Locale locale = getPatientLocale(patient);

        String title = getLocalizedMessage("notification.wear.days.modified.title", null, locale);
        String message = getLocalizedMessage(
                "notification.wear.days.modified.aligners",
                new Object[] {
                    displayName,
                    isCurrentAligner
                            ? getLocalizedMessage("current.and.upcoming", null, locale)
                            : getLocalizedMessage("upcoming", null, locale)
                },
                locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(indexNo)
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .isDoctorApp(false)
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void wearDaysUpdateNotificationFromTracking(
            String displayName, Boolean isCurrentAligner, AlignerJourney alignerJourney, boolean isDrToDisplay) {
        Patient patient = alignerJourney.getPatient();
        Locale locale = getPatientLocale(patient);

        String title = getLocalizedMessage("notification.wear.days.modified.title", null, locale);
        String message = getLocalizedMessage(
                "notification.wear.days.modified.aligners",
                new Object[] {
                    displayName,
                    isCurrentAligner
                            ? getLocalizedMessage("current.and.upcoming", null, locale)
                            : getLocalizedMessage("upcoming", null, locale)
                },
                locale);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(24)
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .isDoctorApp(false)
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForMilestones(AlignerJourney alignerJourney) {
        Patient patient = alignerJourney.getPatient();
        Locale locale = getPatientLocale(patient);
        String mobileNo = patient.getMobileNo();
        String email = patient.getEmail();

        var numbersOfDaysAlignersWornTillNow = alignerJourney.numbersOfDaysAlignersWorn(false, true, false);
        var totalDays = alignerJourney.totalTreatmentDays(false, true);

        if (numbersOfDaysAlignersWornTillNow != null && totalDays != null && totalDays != 0) {
            var oneFourthJourney = Math.ceilDiv(totalDays, 4);
            String titleKey = null;
            String messageKey = null;

            if (numbersOfDaysAlignersWornTillNow == oneFourthJourney) {
                titleKey = "notification.milestone.25.title";
                messageKey = "notification.milestone.25.message";
            } else if (numbersOfDaysAlignersWornTillNow == oneFourthJourney * 2) {
                titleKey = "notification.milestone.50.title";
                messageKey = "notification.milestone.50.message";
            } else if (numbersOfDaysAlignersWornTillNow * 3 == oneFourthJourney * 4) {
                titleKey = "notification.milestone.75.title";
                messageKey = "notification.milestone.75.message";
            }

            if (messageKey != null) {
                String title = getLocalizedMessage(titleKey, null, locale);
                String message = getLocalizedMessage(messageKey, null, locale);
                sendMilestoneNotification(
                        title,
                        message,
                        mobileNo,
                        email,
                        alignerJourney.getPatient().getId());
            }
        }

        var daysRemaining = alignerJourney.daysRemainingTillTreatmentCompletion();
        if (daysRemaining != null) {
            String titleKey = null;
            String messageKey = null;

            if (daysRemaining == 45) {
                titleKey = "notification.milestone.45days.title";
                messageKey = "notification.milestone.45days.message";
            } else if (daysRemaining == 15) {
                titleKey = "notification.milestone.15days.title";
                messageKey = "notification.milestone.15days.message";
            }

            if (messageKey != null) {
                String title = getLocalizedMessage(titleKey, null, locale);
                String message = getLocalizedMessage(messageKey, null, locale);
                sendMilestoneNotification(
                        title,
                        message,
                        mobileNo,
                        email,
                        alignerJourney.getPatient().getId());
            }
        }
    }

    private void sendMilestoneNotification(
            String title, String message, String mobileNo, String email, Long patientId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(16)
                .mobile(mobileNo)
                .email(email)
                .xOrgName(xOrgNameResolver.resolveFromPatientId(patientId).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatientId(patientId).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForTreatmentStartingTomorrow(AlignerJourney alignerJourney) {
        var startDate = alignerJourney.getDoctorTreatmentStartDate();
        if (startDate == null || !startDate.equals(LocalDate.now().plusDays(1))) {
            return;
        }

        var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

        timelineService.addEvent(
                alignerJourney.getPatient().getId(),
                UserType.PATIENT,
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                EventType.TREATMENT_STARTING_TOMORROW,
                new TreatmentStartingTomorrowEventMetadata(AlignerJourneyDetails.from(alignerJourney)));
        var patient = alignerJourney.getPatient();

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Treatment starts tomorrow")
                .message("Your journey to a healthier smile begins tomorrow! Hope you're all set and ready to start!")
                .mobile(patient.getMobileNo())
                .notificationIndex(80)
                .email(patient.getEmail())
                .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Reminder: Starts tomorrow")
                .message(String.format(
                        "%s is starting their treatment tomorrow.",
                        alignerJourney.getPatient().getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(81)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(alignerJourney.getPatient().getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(
                        alignerJourney.getPatient().getId()))
                .xOrgName(xOrgNameResolver
                        .resolveFromPatient(alignerJourney.getPatient())
                        .getXOrgName())
                .organizationId(xOrgNameResolver
                        .resolveFromPatient(alignerJourney.getPatient())
                        .getOrganizationId())
                .build());
    }

    @Override
    public void sendOneDayPriorReminderOfAlignerChange(AlignerJourney alignerJourney) {
        LocalDate alignerChangeDate = alignerJourney.nextAlignerChangeDate();

        if (alignerChangeDate != null) {
            LocalDate oneDayBeforeChangeDate = alignerChangeDate.minusDays(1);
            if (oneDayBeforeChangeDate.isEqual(LocalDate.now())) {
                timelineService.addEvent(
                        alignerJourney.getPatient().getId(),
                        UserType.PATIENT,
                        alignerJourney.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.UPCOMING_ALIGNER_CHANGE,
                        new UpcomingAlignerChangeEventMetaData(AlignerJourneyDetails.from(alignerJourney)));
            }
        }
    }

    @Override
    public void sendOneDayPriorReminderOfAppointment(AppointmentReminder appointment) {
        LocalDate currentDate = LocalDate.now();
        LocalDate oneDayBeforeCurrentDate = currentDate.plusDays(1);

        var doctorDetails = doctorService.getDoctor(appointment.getDoctorId());

        LocalDate currentAppointmentDate = appointment.getDate();
        if (currentAppointmentDate != null
                && currentAppointmentDate.isEqual(oneDayBeforeCurrentDate)
                && doctorDetails != null) {
            chatService.sendNotification(SendNotificationRequest.builder()
                    .title("Review Tomorrow's appointments")
                    .message("Tap to view the list of appointments scheduled for tomorrow")
                    .notificationIndex(60)
                    .mobile(doctorDetails.getMobile())
                    .isDoctorApp(true)
                    .email(doctorDetails.getEmail())
                    .xOrgName(xOrgNameResolver.resolveFromDoctorId(appointment.getDoctorId()))
                    .build());

            log.info("Sent one day prior reminder for appointment: {}", appointment.getId());
        }
    }

    @Override
    public void sendReminderOfAlignerCheckIn(AlignerJourney alignerJourney) {
        LocalDate alignerChangeDate = alignerJourney.nextAlignerChangeDate();
        if (alignerChangeDate == null) {
            log.info("No aligner change date set for journey {}", alignerJourney.getId());
            return;
        }

        LocalDate currentDate = LocalDate.now();
        Aligner currentAligner = alignerJourney.getCurrentAligner();

        if (currentAligner == null) {
            log.info("No current aligner for journey {}", alignerJourney.getId());
            return;
        }

        List<AlignerAction> actions = currentAligner.getActions();

        if (!actions.isEmpty()) {
            boolean hasCheckInAction =
                    actions.stream().anyMatch(action -> action.getType() == AlignerActionType.CHECK_IN);

            if (hasCheckInAction) {
                return;
            }
        }

        Map<Integer, BiConsumer<AlignerJourney, Integer>> reminderActions = Map.of(
                3, this::sendReminderForCheckIn,
                2, this::sendReminderForCheckIn,
                1, this::sendReminderForCheckIn,
                0, this::sendReminderForCheckIn);

        reminderActions.entrySet().stream()
                .filter(entry -> currentDate.isEqual(alignerChangeDate.minusDays(entry.getKey())))
                .findFirst()
                .ifPresent(entry -> {
                    entry.getValue().accept(alignerJourney, entry.getKey());
                });
    }

    private void sendReminderForCheckIn(AlignerJourney alignerJourney, Integer daysRemaining) {
        try {
            Patient patient = alignerJourney.getPatient();
            Locale locale = getPatientLocale(patient);

            String title = getLocalizedMessage("notification.aligner.checkin.title", null, locale);
            String message;

            if (daysRemaining == 0) {
                message = getLocalizedMessage("notification.aligner.checkin.message.today", null, locale);
            } else if (daysRemaining == 1) {
                message = getLocalizedMessage("notification.aligner.checkin.message.tomorrow", null, locale);
            } else {
                message = getLocalizedMessage(
                        "notification.aligner.checkin.message.days", new Object[] {daysRemaining}, locale);
            }

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(71)
                    .mobile(patient.getMobileNo())
                    .isDoctorApp(false)
                    .email(patient.getEmail())
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());

            log.info("Sent check-in reminder for journey {}: {}", alignerJourney.getId(), message);
        } catch (Exception e) {
            log.warn("Failed to send check-in reminder for journey {}", alignerJourney.getId(), e);
        }
    }

    @Override
    public void sendPushNotification(Reminder reminder) {
        var metadata = (PushNotificationReminderChannelMetadata) reminder.getChannelMetadata();
        var mobileNo = metadata.getMobileNo();
        var email = metadata.getEmail();
        var notificationIndex = metadata.getNotificationIndex();
        var patientId = metadata.getPatientId();
        String orderId = null;

        var patient = patientRepository.findById(patientId);

        if (patient.isPresent()) {
            ResourceBundle resourceBundle = ResourceBundle.getBundle("notifications", Locale.ENGLISH);

            String title;
            String message;

            switch (reminder.getPurpose()) {
                case GENERAL_REMINDER:
                    title = getLocalizedTitle(
                            resourceBundle,
                            "notification.general.title",
                            patient.get().getFirstName(),
                            "Reminder: ");
                    message = getLocalizedMessage(
                            resourceBundle,
                            "notification.general.message",
                            "You have a reminder for the patient. Tap to view the note and take action");
                    break;

                case APPOINTMENT:
                case APPOINTMENT_REMINDER:
                    title = getLocalizedTitle(
                            resourceBundle,
                            "notification.appointment.title",
                            patient.get().getFirstName(),
                            "Appointment reminder for ");
                    message = getLocalizedMessage(
                            resourceBundle,
                            "notification.appointment.message",
                            "Your appointment is scheduled. Tap to view details and create appointment.");
                    break;

                case PAYMENTS_PENDING:
                    title = getLocalizedTitle(
                            resourceBundle,
                            "notification.payment.title",
                            patient.get().getFirstName(),
                            "Payment Due for: ");
                    message = getLocalizedMessage(
                            resourceBundle,
                            "notification.payment.message",
                            "Your patient has a pending payment. Tap to add payment.");
                    break;

                case PRODUCTION_ALIGNER_STATUS_PENDING:
                    title = getLocalizedTitle(
                            resourceBundle,
                            "notification.production.title",
                            patient.get().getFirstName(),
                            "Production Update: ");
                    message = getLocalizedMessage(
                            resourceBundle,
                            "notification.production.message",
                            "Production workflow for the patient is due for review. Tap to manage the production.");
                    break;

                case UNPROCESSED_ALIGNER_REMINDER:
                    var unprocessed = (UnprocessedAlignerReminderMetadata) reminder.getMetadata();
                    if (unprocessed != null) {
                        orderId = unprocessed.getOrderId();
                    }
                    title = "Reminder – Start Next Batch";
                    message = "Reminder: Start manufacturing the next batch for "
                            + patient.get().getFirstName();
                    break;

                case TREATMENT_START_REMINDER:
                    title = "Treatment Start Reminder for " + patient.get().getFirstName();
                    message = "Your treatment is starting soon. Tap to confirm the start date and details.";
                    break;

                default:
                    log.warn("Unhandled reminder purpose: {}", reminder.getPurpose());
                    return;
            }

            sendNotification(mobileNo, message, title, notificationIndex, email, patientId, orderId);
            log.info("Sent push notification to email {} for {}", email, reminder.getPurpose());
        } else {
            log.warn("Patient not found for reminder {}", reminder.getId());
        }
    }

    private String getLocalizedTitle(ResourceBundle bundle, String key, String patientName, String defaultPrefix) {
        try {
            String localizedTitle = bundle.getString(key);
            return localizedTitle.replace("{patientName}", patientName);
        } catch (MissingResourceException e) {
            return defaultPrefix + patientName;
        }
    }

    private String getLocalizedMessage(ResourceBundle bundle, String key, String defaultMessage) {
        try {
            return bundle.getString(key);
        } catch (MissingResourceException e) {
            return defaultMessage;
        }
    }

    @Override
    public void webNotificationEvent(Reminder reminder) {
        CalendarResponseTypes responseType;
        Long patientId;
        log.info("Processing reminder {}", reminder.getId());

        switch (reminder.getPurpose()) {
            case PAYMENTS_PENDING:
                responseType = CalendarResponseTypes.PAYMENT_REMINDER;
                patientId = ((PaymentReminderMetadata) reminder.getMetadata())
                        .getPatientDetails()
                        .getId();
                break;
            case PRODUCTION_ALIGNER_STATUS_PENDING:
                responseType = CalendarResponseTypes.PRODUCTION_REMINDER;
                patientId = ((ProdutionReminderMetadata) reminder.getMetadata())
                        .getPatientDetails()
                        .getId();
                break;
            case APPOINTMENT_REMINDER:
                responseType = CalendarResponseTypes.APPOINTMENT_REMINDER;
                patientId = ((AppointmentReminderMetadata) reminder.getMetadata())
                        .getPatientDetails()
                        .getId();
                break;
            case GENERAL_REMINDER:
                responseType = CalendarResponseTypes.GENERAL_REMINDER;
                GeneralReminderMetadata generalMetadata = (GeneralReminderMetadata) reminder.getMetadata();
                patientId = generalMetadata.getPatientDetails() != null
                        ? generalMetadata.getPatientDetails().getId()
                        : null;
                break;
            case APPOINTMENT:
                responseType = CalendarResponseTypes.APPOINTMENT;
                CustomAppointmentReminderMetadata appointmentMetadata =
                        (CustomAppointmentReminderMetadata) reminder.getMetadata();
                patientId = appointmentMetadata.getPatientDetails() != null
                        ? appointmentMetadata.getPatientDetails().getId()
                        : null;
                break;

            case TREATMENT_START_REMINDER:
                responseType = CalendarResponseTypes.TREATMENT_START_REMINDER;
                TreatementStartReminderMetadata treatementStartReminderMetadata =
                        (TreatementStartReminderMetadata) reminder.getMetadata();
                patientId = treatementStartReminderMetadata.getPatientId() != null
                        ? treatementStartReminderMetadata.getPatientId()
                        : null;
                break;

            case UNPROCESSED_ALIGNER_REMINDER:
                responseType = CalendarResponseTypes.UNPROCESSED_ALIGNER_REMINDER;
                UnprocessedAlignerReminderMetadata unprocessedAlignerReminderMetadata =
                        (UnprocessedAlignerReminderMetadata) reminder.getMetadata();
                patientId = unprocessedAlignerReminderMetadata.getPatientId() != null
                        ? unprocessedAlignerReminderMetadata.getPatientId()
                        : null;
                break;
            default:
                return;
        }

        if (patientId != null) {
            log.info("Adding event to timeline for patient {}", patientId);
            var profileId = reminder.getUserProfile().getId();
            var userProfile = userProfileRepository.findById(profileId);

            userProfile.ifPresent(profile -> timelineService.addEvent(
                    patientId,
                    UserType.PATIENT,
                    reminder.getAddedByUserId(),
                    UserType.DOCTOR,
                    EventType.CALENDAR_REMINDER,
                    new CalendarEventMetadata(reminder.getId(), responseType, reminder.getDate(), patientId),
                    profile,
                    profile.getOrganization()));
        } else {
            log.info("Patient id is null for reminder {} {}", reminder.getId(), reminder.getPurpose());
        }
    }

    public void forceAlignerChangeNotification(Integer previousAlignerNo, int newAlignerNo, Patient patient) {
        try {
            Locale locale = getPatientLocale(patient);

            String title = getLocalizedMessage("notification.aligner.advance.title", null, locale);
            String message = getLocalizedMessage("notification.aligner.advance.message", null, locale);
            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(61)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send force aligner change notification");
        }
    }

    @Override
    public void pauseAlignerJourneyNotification(String firstName, Patient patient, boolean isDrToDisplay) {
        try {
            Locale locale = getPatientLocale(patient);

            String title = getLocalizedMessage("notification.aligner.pause.title", null, locale);
            String message =
                    getLocalizedMessage("notification.aligner.pause.message", new Object[] {firstName}, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(62)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send pause aligner journey notification");
        }
    }

    @Override
    public void deactivatedAlignerJourneyNotification(String firstName, Patient patient) {
        try {
            Locale locale = getPatientLocale(patient);
            String title = getLocalizedMessage("notification.aligner.deactivate.title", null, locale);
            String message = getLocalizedMessage("notification.aligner.deactivate.message", null, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(64)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send deactivated aligner journey notification");
        }
    }

    @Override
    public void resumeAlignerJourneyNotification(String firstName, Patient patient, boolean isDrToDisplay) {
        try {
            Locale locale = getPatientLocale(patient);

            String title = getLocalizedMessage("notification.aligner.resume.title", null, locale);
            String message =
                    getLocalizedMessage("notification.aligner.resume.message", new Object[] {firstName}, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(63)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send resume aligner journey notification");
        }
    }

    @Override
    public void notifyMoveToPreviousAligner(Patient patient, DoctorDetails doctor, String displayName) {
        try {
            Locale locale = getPatientLocale(patient);

            String title = getLocalizedMessage("notification.aligner.previous.title", null, locale);
            String message =
                    getLocalizedMessage("notification.aligner.previous.message", new Object[] {displayName}, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(66)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send move to previous aligner notification");
        }
    }

    @Override
    public void notifyAlignerActionValidated(
            Patient patient, DoctorDetails doctor, @NotNull AlignerActionType type, boolean isDrToDisplay) {
        try {
            if (type == AlignerActionType.ISSUE_REPORT) {
                return;
            }

            Locale locale = getPatientLocale(patient);

            String displayName = doctor.getFirstName();

            var notificationIdx =
                    switch (type) {
                        case CHECK_IN -> 65;
                        case ALIGNER_CHANGE, FORCE_ALIGNER_CHANGE -> 67;
                        case MOVE_TO_PREVIOUS_ALIGNER -> 68;
                        case ALL -> 70;
                        case MANUAl_ALIGNER_CHANGE,
                                TREATMENT_PAUSED,
                                WEAR_DAYS_UPDATED,
                                REMINDER_SENT_TO_PATIENT,
                                TREATMENT_RESUMED,
                                ALIGNER_CHANGE_SCHEDULED,
                                ALIGNER_CHANGE_PENDING_APPROVAL,
                                CHECK_IN_PENDING_APPROVAL,
                                ALIGNER_CHANGE_OVERDUE,
                                AWAITING_RESUME_APPROVAL,
                                TREATMENT_DEACTIVATED,
                                CREATE_REFINEMENT_REMINDER,
                                ALIGNER_CHANGE_OVERDUE_PENDING_ACTION -> 0;
                        default -> throw new IllegalStateException("Unexpected value: " + type);
                    };

            String title = getLocalizedMessage("notification.aligner.action.validated.title", null, locale);
            String message = getLocalizedMessage(
                    "notification.aligner.action.validated.message", new Object[] {displayName}, locale);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(notificationIdx)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send aligner action validation notification for type: {}", type, e);
        }
    }

    private void sendNotification(
            String mobileNo,
            String message,
            String title,
            int notificationIndex,
            String email,
            Long patientId,
            String orderId) {
        var request = SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(notificationIndex)
                .mobile(mobileNo)
                .email(email)
                .isDoctorApp(true)
                .patientId(patientId)
                .globalId(orderId)
                .xOrgName(xOrgNameResolver.resolveFromPatientId(patientId).getXOrgName())
                .organizationId(xOrgNameResolver.resolveFromPatientId(patientId).getOrganizationId())
                .build();
        chatService.sendNotification(request);
    }

    @Override
    public void sendPatientAppointmentReminder(
            String mobileNo,
            String message,
            String title,
            int notificationIndex,
            Patient patient,
            Long reminderId,
            LocalDate startDate,
            String startTime) {
        try {
            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(notificationIndex)
                    .mobile(mobileNo)
                    .email(patient.getEmail())
                    .patientId(patient.getId())
                    .isDoctorApp(false)
                    .globalId(reminderId.toString())
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        } catch (Exception e) {
            log.warn("Unable to send notification for appointment reminder", e);
        }
    }

    public String getLocalizedMessages(Patient patient, String key, Object[] args) {
        try {
            Locale locale = getPatientLocale(patient);
            return messageSource.getMessage(key, args, locale);
        } catch (NoSuchMessageException e) {
            return messageSource.getMessage(key, args, Locale.ENGLISH);
        }
    }
}
