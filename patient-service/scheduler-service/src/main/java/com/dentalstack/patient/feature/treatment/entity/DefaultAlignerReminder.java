package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.reminder.dto.SetDefaultReminderRequest;
import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.*;

@Entity
@Table(
        name = "aligner_default_reminder",
        indexes = {
            @Index(name = "IX_default_aligner_reminder_aligner_journey", columnList = "aligner_journey_id"),
            @Index(name = "IX_default_aligner_reminder_time", columnList = "time")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DefaultAlignerReminder extends BaseEntity {
    @NotNull
    @ManyToOne
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;

    @NotNull
    @Enumerated(EnumType.STRING)
    private DefaultAlignerReminderType type;

    @NotNull
    private LocalTime time;

    @NotNull
    private String name;

    public static DefaultAlignerReminder from(SetDefaultReminderRequest request, AlignerJourney alignerJourney) {
        return DefaultAlignerReminder.builder()
                .name(request.getName())
                .alignerJourney(alignerJourney)
                .type(request.getDefaultAlignerReminderType())
                .time(request.getTime())
                .build();
    }

    public LocalDate changeDate(Aligner aligner) {
        var changeDate = aligner.getEndDate();
        return switch (type) {
            case ALIGNER_CHANGE_DATE -> changeDate;
            case DAY_BEFORE_ALIGNER_CHANGE_DATE -> changeDate.minusDays(1);
        };
    }

    public String mobileNo() {
        if (alignerJourney == null
                || alignerJourney.getPatient() == null
                || alignerJourney.getPatient().getMobileNo() == null) return null;
        return alignerJourney.getPatient().getMobileNo();
    }
}
