package com.dentalstack.doctor.entity.reminder;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.patient.Frequency;
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
}
