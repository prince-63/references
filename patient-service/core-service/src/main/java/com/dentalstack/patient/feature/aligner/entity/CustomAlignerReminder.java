package com.dentalstack.patient.feature.aligner.entity;

import com.dentalstack.patient.feature.reminder.dto.SetReminderRequest;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(
        name = "aligner_custom_reminder",
        indexes = {
            @Index(name = "IX_custom_aligner_reminder_aligner_journey", columnList = "aligner_journey_id"),
            @Index(name = "IX_custom_aligner_reminder_time", columnList = "time")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomAlignerReminder extends BaseEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_journey_id")
    @ToString.Exclude
    private AlignerJourney alignerJourney;

    @NotNull
    private String name;

    private LocalDate date;

    @NotNull
    private LocalTime time;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    private boolean active;

    public static CustomAlignerReminder from(
            SetReminderRequest request, LocalDate date, AlignerJourney alignerJourney) {
        return CustomAlignerReminder.builder()
                .name(request.getName())
                .alignerJourney(alignerJourney)
                .date(date)
                .time(request.getTime())
                .frequency(request.getFrequency())
                .active(true)
                .build();
    }

    public String mobileNo() {
        if (alignerJourney == null
                || alignerJourney.getPatient() == null
                || alignerJourney.getPatient().getMobileNo() == null) return null;
        return alignerJourney.getPatient().getMobileNo();
    }

    public String getEmail() {
        if (alignerJourney == null
                || alignerJourney.getPatient() == null
                || alignerJourney.getPatient().getEmail() == null) return null;
        return alignerJourney.getPatient().getEmail();
    }
}
