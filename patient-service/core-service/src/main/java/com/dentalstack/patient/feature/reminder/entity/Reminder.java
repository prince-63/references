package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.AddAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.reminder.SetAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.reminder.UpdateCustomAppointmentReminderRequest;
import com.dentalstack.patient.feature.doctor.entity.Organization;
import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.payment.dto.UpdatePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.reminder.SetPaymentReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateReminderRequest;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderCategory;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.config.TimezoneConfig;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import lombok.*;
import org.quartz.JobKey;
import org.quartz.TriggerKey;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "reminder")
public class Reminder extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    public static final String REMINDER_INFO_KEY = "reminder_info";
    public static final String REMINDERS_GROUP = "reminders_group";

    @NotNull
    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    @NotNull
    private LocalTime time;

    @Nullable
    private LocalDate date;

    @NotNull
    @Builder.Default
    private ZoneId zone = TimezoneConfig.DEFAULT_ZONE_ID;

    @Enumerated(EnumType.STRING)
    private ReminderChannel channel;

    @Enumerated(EnumType.STRING)
    private ReminderPurpose purpose;

    @NotNull
    private String message;

    private String title;

    @Enumerated(EnumType.STRING)
    private ReminderStatus status;

    private ZonedDateTime lastTriggeredAt;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private ReminderMetadata metadata;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private ReminderChannelMetadata channelMetadata;

    private Long addedByUserId;
    private Long addedForUserId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    public static Reminder from(
            SetPaymentReminderRequest request,
            String mobileNo,
            String message,
            String title,
            Long patientId,
            String email,
            PatientDetails patientDetails,
            UserProfile userProfile) {
        var channelMetadata = PushNotificationReminderChannelMetadata.builder()
                .mobileNo(mobileNo)
                .title(title)
                .notificationIndex(20)
                .patientId(patientId)
                .email(email)
                .build();
        var metadata = new PaymentReminderMetadata(
                request.getNote(), request.getAmount(), request.getPatientId(), patientDetails);

        return Reminder.builder()
                .frequency(Frequency.ONE_TIME)
                .time(request.getTime())
                .date(request.getDate())
                .zone(ZoneId.of(request.getTimezone()))
                .message(message)
                .channel(ReminderChannel.PUSH_NOTIFICATION)
                .purpose(ReminderPurpose.PAYMENTS_PENDING)
                .status(ReminderStatus.ACTIVE)
                .channelMetadata(channelMetadata)
                .metadata(metadata)
                .addedByUserId(request.getDoctorId())
                .addedForUserId(patientId)
                .userProfile(userProfile)
                .organization(userProfile != null ? userProfile.getOrganization() : null)
                .build();
    }

    public static Reminder createReminder(
            SetCustomReminderRequest request,
            String mobileNo,
            String message,
            String title,
            Long alignerJourneyId,
            Long patientId,
            String email,
            PatientDetails patientDetails,
            UserProfile userProfile,
            String orderId) {

        var fixedZone = TimezoneConfig.DEFAULT_ZONE_ID;

        var reminderCategory = request.getReminderCategory();
        var channelMetadata = PushNotificationReminderChannelMetadata.builder()
                .mobileNo(mobileNo)
                .title(title)
                .patientId(patientId)
                .email(email)
                .build();

        ReminderMetadata metadata;
        ReminderPurpose purpose;
        int notificationIndex;

        switch (reminderCategory) {
            case PAYMENT_REMINDER:
                metadata = new PaymentReminderMetadata(
                        request.getNotes(), request.getAmount(), request.getPatientId(), patientDetails);
                metadata.setType(ReminderMetadata.ReminderMetadataType.PAYMENTS_PENDING);
                purpose = ReminderPurpose.PAYMENTS_PENDING;
                notificationIndex = 20;
                break;
            case GENERAL_REMINDER:
                metadata = new GeneralReminderMetadata(request.getNotes(), request.getPatientId(), patientDetails);
                metadata.setType(ReminderMetadata.ReminderMetadataType.GENERAL_REMINDER);
                purpose = ReminderPurpose.GENERAL_REMINDER;
                notificationIndex = 95;
                break;
            case APPOINTMENT_REMINDER:
                metadata = new AppointmentReminderMetadata(patientDetails, request.getNotes());
                metadata.setType(ReminderMetadata.ReminderMetadataType.APPOINTMENT_REMINDER);
                purpose = ReminderPurpose.APPOINTMENT_REMINDER;
                notificationIndex = 96;
                break;
            case PRODUCTION_REMINDER:
                metadata = new ProdutionReminderMetadata(
                        patientId, request.getDoctorId(), request.getNotes(), patientDetails, alignerJourneyId);
                metadata.setType(ReminderMetadata.ReminderMetadataType.PRODUCTION_ALIGNER_STATUS_PENDING);
                purpose = ReminderPurpose.PRODUCTION_ALIGNER_STATUS_PENDING;
                notificationIndex = 85;
                break;

            case TREATMENT_START_REMINDER:
                metadata = new TreatementStartReminderMetadata(patientId);
                metadata.setType(ReminderMetadata.ReminderMetadataType.TREATMENT_START_REMINDER);
                purpose = ReminderPurpose.TREATMENT_START_REMINDER;
                notificationIndex = 130;
                break;
            case UNPROCESSED_ALIGNER_REMINDER:
                metadata = new UnprocessedAlignerReminderMetadata(patientId, alignerJourneyId, orderId);
                metadata.setType(ReminderMetadata.ReminderMetadataType.UNPROCESSED_ALIGNER_REMINDER);
                purpose = ReminderPurpose.UNPROCESSED_ALIGNER_REMINDER;
                notificationIndex = 131;
                break;
            default:
                throw new IllegalArgumentException("Invalid reminder category: " + reminderCategory);
        }

        channelMetadata.setNotificationIndex(notificationIndex);

        var getTitle = getTitleForEmpty(request);

        return Reminder.builder()
                .frequency(Frequency.ONE_TIME)
                .time(request.getTime())
                .date(request.getDate())
                .zone(fixedZone)
                .message(message)
                .channel(ReminderChannel.PUSH_NOTIFICATION)
                .purpose(purpose)
                .status(ReminderStatus.ACTIVE)
                .channelMetadata(channelMetadata)
                .metadata(metadata)
                .title(getTitle)
                .addedByUserId(request.getDoctorId())
                .addedForUserId(patientId)
                .userProfile(userProfile)
                .organization(userProfile != null ? userProfile.getOrganization() : null)
                .build();
    }

    private static String getTitleForEmpty(SetCustomReminderRequest request) {
        if (request.getTitle() != null) {
            return request.getTitle();
        } else if (request.getReminderCategory().equals(ReminderCategory.TREATMENT_START_REMINDER)) {
            return "Treatment start reminder";
        } else if (request.getReminderCategory().equals(ReminderCategory.UNPROCESSED_ALIGNER_REMINDER)) {
            return "Start manufacturing";
        }
        return null;
    }

    public static Reminder customAppointmentReminder(
            SetAppointmentReminderRequest request,
            String mobileNo,
            String message,
            String title,
            Long patientId,
            String email,
            PatientDetails patientDetails,
            PracticeLocation practiceLocation,
            UserProfile userProfile) {
        var channelMetadata = PushNotificationReminderChannelMetadata.builder()
                .mobileNo(mobileNo)
                .title(title)
                .notificationIndex(20)
                .patientId(patientId)
                .email(email)
                .build();
        var metadata = getCustomAppointmentReminderMetadata(request, patientDetails, practiceLocation);
        ZonedDateTime startDate = request.getStartDate();
        var fixedZone = TimezoneConfig.DEFAULT_ZONE_ID;

        return Reminder.builder()
                .frequency(Frequency.ONE_TIME)
                .time(startDate.toLocalTime())
                .date(startDate.toLocalDate())
                .zone(fixedZone)
                .message(message)
                .channel(ReminderChannel.PUSH_NOTIFICATION)
                .purpose(ReminderPurpose.APPOINTMENT)
                .status(ReminderStatus.ACTIVE)
                .channelMetadata(channelMetadata)
                .metadata(metadata)
                .addedByUserId(request.getDoctorId())
                .addedForUserId(patientId)
                .userProfile(userProfile)
                .organization(userProfile != null ? userProfile.getOrganization() : null)
                .build();
    }

    @NonNull
    private static CustomAppointmentReminderMetadata getCustomAppointmentReminderMetadata(
            SetAppointmentReminderRequest request, PatientDetails patientDetails, PracticeLocation practiceLocation) {
        String practiceLocationName = null;
        String practiceLocationCity = null;
        Long practiceLocationId = null;
        String practiceLocationAddress = null;

        if (practiceLocation != null) {
            practiceLocationName = practiceLocation.getPracticeLocationName();
            practiceLocationCity = practiceLocation.getCity();
            practiceLocationId = practiceLocation.getId();
            practiceLocationAddress = practiceLocation.getAddress();
        }
        return new CustomAppointmentReminderMetadata(
                request.getName(),
                request.getPatientId(),
                patientDetails,
                request.getNotes(),
                request.getStartDate(),
                request.getEndDate(),
                request.getAmount(),
                practiceLocationName,
                practiceLocationAddress,
                practiceLocationCity,
                practiceLocationId,
                false);
    }

    public static Reminder from(
            AddAlignerProductionReminderRequest request,
            String mobileNo,
            String message,
            String title,
            Long alignerJourneyId,
            Long patientId,
            String email,
            Long doctorId,
            PatientDetails patientDetails,
            UserProfile userProfile) {
        var channelMetadata = PushNotificationReminderChannelMetadata.builder()
                .mobileNo(mobileNo)
                .title(title)
                .notificationIndex(85)
                .patientId(patientId)
                .email(email)
                .build();

        var metadata = new ProdutionReminderMetadata(
                patientId, doctorId, request.getNotes(), patientDetails, alignerJourneyId);

        return Reminder.builder()
                .frequency(Frequency.ONE_TIME)
                .time(LocalTime.of(9, 0, 0))
                .date(request.getDate())
                .zone(TimezoneConfig.DEFAULT_ZONE_ID)
                .message(message)
                .channel(ReminderChannel.PUSH_NOTIFICATION)
                .purpose(ReminderPurpose.PRODUCTION_ALIGNER_STATUS_PENDING)
                .status(ReminderStatus.ACTIVE)
                .channelMetadata(channelMetadata)
                .metadata(metadata)
                .addedByUserId(doctorId)
                .addedForUserId(patientId)
                .userProfile(userProfile)
                .organization(userProfile != null ? userProfile.getOrganization() : null)
                .build();
    }

    public JobKey jobKey() {
        return JobKey.jobKey(jobKeyStr(), REMINDERS_GROUP);
    }

    public TriggerKey triggerKey() {
        return TriggerKey.triggerKey(jobKeyStr(), REMINDERS_GROUP);
    }

    private String jobKeyStr() {
        return String.join(
                "_",
                getId().toString(),
                getPurpose().toString().toLowerCase(),
                getChannel().toString().toLowerCase(),
                getFrequency().toString().toLowerCase());
    }

    public Optional<ZonedDateTime> nextTriggerTime() {
        return nextTriggerTime(this.date, this.time, this.zone);
    }

    public static Optional<ZonedDateTime> nextTriggerTime(
            @Nullable LocalDate date, @NotNull LocalTime time, @NotNull ZoneId zone) {
        var now = ZonedDateTime.now();
        if (date != null) {
            var triggerTime = ZonedDateTime.of(date, time, zone);

            return Optional.ofNullable(triggerTime.isBefore(now) ? null : triggerTime);
        } else {
            var today = LocalDate.now();
            var triggerTime = ZonedDateTime.of(today, time, zone);
            return Optional.of(triggerTime.isBefore(now) ? triggerTime.plusDays(1) : triggerTime);
        }
    }

    public void update(UpdatePaymentReminderRequest request, PatientDetails patientDetails) {
        this.date = request.getDate();
        this.zone = TimezoneConfig.DEFAULT_ZONE_ID;
        this.time = request.getTime();
        this.metadata = new PaymentReminderMetadata(
                request.getNote(), request.getAmount(), request.getPatientId(), patientDetails);
    }

    public void updateReminder(UpdateReminderRequest request, PatientDetails patientDetails) {
        this.date = request.getDate();
        this.zone = TimezoneConfig.DEFAULT_ZONE_ID;
        this.time = request.getTime();
        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            this.title = request.getTitle();
        }

        switch (request.getReminderCategory()) {
            case PAYMENT_REMINDER:
                this.metadata = new PaymentReminderMetadata(
                        request.getNotes(), request.getAmount(), request.getPatientId(), patientDetails);
                break;
            case GENERAL_REMINDER:
                this.metadata = new GeneralReminderMetadata(request.getNotes(), request.getPatientId(), patientDetails);
                break;
            case APPOINTMENT_REMINDER:
                this.metadata = new AppointmentReminderMetadata(patientDetails, request.getNotes());
                break;
            case PRODUCTION_REMINDER:
                this.metadata = new ProdutionReminderMetadata(
                        request.getPatientId(),
                        request.getDoctorId(),
                        request.getNotes(),
                        patientDetails,
                        request.getAlignerJourneyId());
                break;

            case UNPROCESSED_ALIGNER_REMINDER, TREATMENT_START_REMINDER:
                break;

            default:
                throw new IllegalArgumentException("Invalid reminder category: " + request.getReminderCategory());
        }
    }

    public void updateAppointmentReminder(
            UpdateCustomAppointmentReminderRequest request,
            PracticeLocation practiceLocation,
            PatientDetails patientDetails,
            Boolean isBracesNotesAdded) {

        String practiceLocationName = null;
        String practiceLocationCity = null;
        String practiceLocationAddress = null;

        Long practiceLocationId = null;

        if (practiceLocation != null) {
            practiceLocationName = practiceLocation.getPracticeLocationName();
            practiceLocationCity = practiceLocation.getCity();
            practiceLocationId = practiceLocation.getId();
            practiceLocationAddress = practiceLocation.getAddress();
        }
        this.date = request.getStartDate().toLocalDate();
        this.time = request.getStartDate().toLocalTime();
        this.zone = TimezoneConfig.DEFAULT_ZONE_ID;

        this.metadata = new CustomAppointmentReminderMetadata(
                patientDetails.getFullName(),
                patientDetails.getId(),
                patientDetails,
                request.getNotes(),
                request.getStartDate(),
                request.getEndDate(),
                request.getAmount(),
                practiceLocationName,
                practiceLocationAddress,
                practiceLocationCity,
                practiceLocationId,
                isBracesNotesAdded);
    }
}
