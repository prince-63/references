package com.dentalstack.patient.feature.notification.service;

import static com.dentalstack.patient.feature.notification.enums.ComplianceNotificationCycle.*;

import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.calendar.dto.CalendarResponseTypes;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.calendar.CalendarEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.TreatmentStartingTomorrowEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.UpcomingAlignerChangeEventMetaData;
import com.dentalstack.patient.feature.events.service.TimelineService;
import com.dentalstack.patient.feature.manufacturing.AlignerInfo;
import com.dentalstack.patient.feature.manufacturing.UnprocessedAlignerData;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.UnprocessedAlignerDue;
import com.dentalstack.patient.feature.notification.enums.ComplianceNotificationCycle;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.entity.*;
import com.dentalstack.patient.feature.subscription.service.SubscriptionService;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.entity.action.AlignerAction;
import com.dentalstack.patient.feature.treatment.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.treatment.enums.Compliance;
import com.dentalstack.patient.feature.whatsapp.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.global.enums.Language;
import com.dentalstack.patient.global.enums.UserType;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    private final TimelineService timelineService;
    private final MessageSource messageSource;
    private final PatientRepository patientRepository;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final SubscriptionService subscriptionService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private static final Locale DEFAULT_LOCALE = Locale.ENGLISH;

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
                        .build());

                // Send notification to doctor
                chatService.sendNotification(SendNotificationRequest.builder()
                        .title("Missed aligner change")
                        .message("Missed changing to Aligner" + " " + currentAligner.getSrNo())
                        .mobile(patient.getMobileNo())
                        .notificationIndex(22)
                        .email(patient.getEmail())
                        .isDoctorApp(true)
                        .patientId(patient.getId())
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
                .build());
        var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Reminder: Starts today")
                .message(String.format(
                        "%s is starting their treatment today.",
                        alignerJourney.getPatient().getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(82)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(alignerJourney.getPatient().getId())
                .build());
    }

    @Override
    public void notificationForResumePausedTreatment(Patient patient, DoctorDetails doctor, Long alignerJourneyId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Reminder: Resume treatment")
                .message(String.format("You had set a reminder to resume treatment of %s's", patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(86)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .build());
    }

    @Override
    public void notificationForAlignerChangeScheduled(
            Patient patient, DoctorDetails doctor, int x, int y, Long alignerJourneyId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Scheduled Aligner changed")
                .message(String.format(
                        "%s has been automatically moved Aligner %d to Aligner %d as scheduled.  Tap here to update any necessary changes..",
                        patient.getFirstName(), x, y))
                .mobile(doctor.getMobile())
                .notificationIndex(87)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .alignerJourneyId(alignerJourneyId)
                .build());
    }

    @Override
    public void notificationForRefinementReminder(Patient patient, DoctorDetails doctor) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Reminder: Set up new plan")
                .message(String.format(
                        "It's been 10 days since deactivating %s's last plan. Please set up a new plan.",
                        patient.getFirstName()))
                .mobile(doctor.getMobile())
                .notificationIndex(88)
                .email(doctor.getEmail())
                .isDoctorApp(true)
                .patientId(patient.getId())
                .build());
    }

    @Override
    public void notificationForUnprocessedAlignerDue(
            Long patientId,
            String email,
            String mobile,
            UnprocessedAlignerData alignerData,
            String patientFirstName,
            String orgName) {

        String message = buildNotificationMessage(patientFirstName, alignerData);

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Reminder: Unprocessed Aligners Due Soon")
                .message(message)
                .mobile(mobile)
                .notificationIndex(155)
                .email(email)
                .isDoctorApp(true)
                .patientId(patientId)
                .build());

        // Extract aligner information from pending aligners
        AlignerInfo pendingAligners = alignerData.getPending();

        chatService.unprocessedDue(UnprocessedAlignerDue.builder()
                .patientName(patientFirstName)
                .email(email)
                .orgName(orgName)
                .dueDate(alignerData.getDueBy() != null ? alignerData.getDueBy().toString() : null)
                .upperStart(
                        pendingAligners.getUpperRangeStart() != null
                                ? pendingAligners.getUpperRangeStart().toString()
                                : null)
                .upperEnd(
                        pendingAligners.getUpperRangeEnd() != null
                                ? pendingAligners.getUpperRangeEnd().toString()
                                : null)
                .lowerStart(
                        pendingAligners.getLowerRangeStart() != null
                                ? pendingAligners.getLowerRangeStart().toString()
                                : null)
                .lowerEnd(
                        pendingAligners.getLowerRangeEnd() != null
                                ? pendingAligners.getLowerRangeEnd().toString()
                                : null)
                .build());
    }

    private String buildNotificationMessage(String patientFirstName, UnprocessedAlignerData alignerData) {
        int daysUntilDue = alignerData.getDaysUntilDue();
        LocalDate dueDate = alignerData.getDueBy();

        AlignerInfo pendingAligners = alignerData.getPending();
        int pendingCount = pendingAligners.getCount();

        if (daysUntilDue == 0) {
            return String.format(
                    "%s has %d unprocessed aligner(s) due TODAY (%s). Please process them urgently.",
                    patientFirstName, pendingCount, dueDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        } else if (daysUntilDue == 1) {
            return String.format(
                    "%s has %d unprocessed aligner(s) due TOMORROW (%s). Please process them soon.",
                    patientFirstName, pendingCount, dueDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        } else if (daysUntilDue <= 3) {
            return String.format(
                    "%s has %d unprocessed aligner(s) due in %d days (%s). Please process them at your earliest convenience.",
                    patientFirstName,
                    pendingCount,
                    daysUntilDue,
                    dueDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        } else {
            return String.format(
                    "Upcoming: %s has %d unprocessed aligner(s) due on %s (%d days). Please plan to process them.",
                    patientFirstName,
                    pendingCount,
                    dueDate.format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                    daysUntilDue);
        }
    }

    private int calculatePendingAlignerCount(AlignerInfo pendingAligners) {
        int totalPending = 0;

        if (pendingAligners.getUpperRangeStart() != null && pendingAligners.getUpperRangeEnd() != null) {
            totalPending += (pendingAligners.getUpperRangeEnd() - pendingAligners.getUpperRangeStart() + 1);
        }
        if (pendingAligners.getLowerRangeStart() != null && pendingAligners.getLowerRangeEnd() != null) {
            totalPending += (pendingAligners.getLowerRangeEnd() - pendingAligners.getLowerRangeStart() + 1);
        }

        return totalPending;
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
                .build());
    }

    private String getLocalizedMessage(String key, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (NoSuchMessageException e) {
            return messageSource.getMessage(key, args, Locale.ENGLISH);
        }
    }

    private String getDueDateString(int daysSinceDue) {
        if (daysSinceDue == 0) {
            return "today";
        } else if (daysSinceDue == 1) {
            return "yesterday";
        } else {
            return daysSinceDue + " days ago";
        }
    }

    @Override
    public void notificationForAlignerChangeReminder(AlignerJourney alignerJourney, SendNotificationRequest request) {
        Locale locale = getPatientLocale(alignerJourney.getPatient());

        var tracking = alignerJourney.getTracking();
        if (tracking != null && !tracking.getTrackingType().equals(TrackingType.MANUAL)) {
            String title = messageSource.getMessage("notification.aligner.wear.title", null, locale);
            String message;

            // Check the message content and select the corresponding localized message
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
                    .build();

            chatService.sendNotification(localizedRequest);

            int aligner = alignerJourney.getCurrentAligner().getSrNo();
            var organizations =
                    patientDoctorOrganizationRepository.findPatientDoctorOrganizationsWithPatientByPatientId(
                            alignerJourney.getPatient().getId());
            if (organizations.isEmpty()) return;
            var orgWhatsAppDetails = subscriptionService.isWhatsAppMessagingEnabled(
                    organizations.get().getDoctor().getId(),
                    organizations.get().getUserProfile().getId());
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
            // 25% journey is complete for the current aligner
            notificationForCompliance(patient, compliance, TWENTY_FIVE_PERCENT_COMPLETE);
        } else if (noOfDaysWorn == 2 * fourthJourney) {
            // 50% journey is complete for the current aligner
            notificationForCompliance(patient, compliance, FIFTY_PERCENT_COMPLETE);
        } else if (currentAligner.dayRemaining() == 2) {
            // Two days are remaining
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
                return; // No notification for good compliance
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

            if (numbersOfDaysAlignersWornTillNow == oneFourthJourney) { // 25% complete
                titleKey = "notification.milestone.25.title";
                messageKey = "notification.milestone.25.message";
            } else if (numbersOfDaysAlignersWornTillNow == oneFourthJourney * 2) { // 50% complete
                titleKey = "notification.milestone.50.title";
                messageKey = "notification.milestone.50.message";
            } else if (numbersOfDaysAlignersWornTillNow * 3 == oneFourthJourney * 4) { // 75% complete
                titleKey = "notification.milestone.75.title";
                messageKey = "notification.milestone.75.message";
            }

            if (messageKey != null) {
                String title = getLocalizedMessage(titleKey, null, locale);
                String message = getLocalizedMessage(messageKey, null, locale);
                sendMilestoneNotification(title, message, mobileNo, email);
            }
        }

        var daysRemaining = alignerJourney.daysRemainingTillTreatmentCompletion();
        if (daysRemaining != null) {
            String titleKey = null;
            String messageKey = null;

            if (daysRemaining == 45) {
                titleKey = "notification.milestone.45days.title";
                messageKey = "notification.milestone.45days.message";
            } else if (daysRemaining == 15) { // Fifteen days left
                titleKey = "notification.milestone.15days.title";
                messageKey = "notification.milestone.15days.message";
            }

            if (messageKey != null) {
                String title = getLocalizedMessage(titleKey, null, locale);
                String message = getLocalizedMessage(messageKey, null, locale);
                sendMilestoneNotification(title, message, mobileNo, email);
            }
        }
    }

    private void sendMilestoneNotification(String title, String message, String mobileNo, String email) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(16)
                .mobile(mobileNo)
                .email(email)
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
                log.info("Check-in already performed for journey {}", alignerJourney.getId());
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
                    log.info(
                            "Sending reminder for journey {} ({} days before change)",
                            alignerJourney.getId(),
                            entry.getKey());
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
                    .build());

            log.info("Sent check-in reminder for journey {}: {}", alignerJourney.getId(), message);
        } catch (Exception e) {
            log.warn("Failed to send check-in reminder for journey {}", alignerJourney.getId(), e);
        }
    }

    // todo do not change
    @Override
    public void sendPushNotification(Reminder reminder) {
        var metadata = (PushNotificationReminderChannelMetadata) reminder.getChannelMetadata();
        var mobileNo = metadata.getMobileNo();
        var email = metadata.getEmail();
        var notificationIndex = metadata.getNotificationIndex();
        var patientId = metadata.getPatientId();

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

                default:
                    log.warn("Unhandled reminder purpose: {}", reminder.getPurpose());
                    return;
            }

            sendNotification(mobileNo, message, title, notificationIndex, email, patientId);
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
            default:
                return;
        }

        if (patientId != null) {
            log.info("Adding event to timeline for patient {}", patientId);
            timelineService.addEvent(
                    patientId,
                    UserType.PATIENT,
                    reminder.getAddedByUserId(),
                    UserType.DOCTOR,
                    EventType.CALENDAR_REMINDER,
                    new CalendarEventMetadata(reminder.getId(), responseType, reminder.getDate(), patientId));
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
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send force aligner change notification");
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
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send resume aligner journey notification");
        }
    }

    private void sendNotification(
            String mobileNo, String message, String title, int notificationIndex, String email, Long patientId) {
        var request = SendNotificationRequest.builder()
                .title(title)
                .message(message)
                .notificationIndex(notificationIndex)
                .mobile(mobileNo)
                .email(email)
                .isDoctorApp(true)
                .patientId(patientId)
                .build();
        chatService.sendNotification(request);
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
