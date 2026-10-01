package com.dentalstack.patient.feature.reminder.entity;

import com.dentalstack.patient.feature.appointment.dto.reminder.SetAppointmentReminderRequest;
import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import com.dentalstack.patient.feature.doctor.entity.organization.Organization;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetPaymentReminderRequest;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.user.entity.UserProfile;
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
    private ZoneId zone = ZoneId.of("Asia/Kolkata");

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
            UserProfile userProfile) {

        var fixedZone = ZoneId.of("Asia/Kolkata");

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
            default:
                throw new IllegalArgumentException("Invalid reminder category: " + reminderCategory);
        }

        channelMetadata.setNotificationIndex(notificationIndex);

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
                .title(request.getTitle())
                .addedByUserId(request.getDoctorId())
                .addedForUserId(patientId)
                .userProfile(userProfile)
                .organization(userProfile != null ? userProfile.getOrganization() : null)
                .build();
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
        var fixedZone = ZoneId.of("Asia/Kolkata");

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
}
