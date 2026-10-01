package com.dentalstack.patient.feature.aligner.entity.logs;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.*;
import lombok.*;

@Entity
@Table(
        name = "aligner_wear_time_sessions",
        indexes = {
            @Index(name = "IX_aligner_wear_session_aligner_journey_id", columnList = "aligner_journey_id"),
            @Index(name = "IX_aligner_wear_session_aligner_id", columnList = "aligner_id"),
            @Index(name = "IX_aligner_wear_session_start_time", columnList = "startTime"),
            @Index(name = "IX_aligner_wear_session_end_time", columnList = "endTime"),
            @Index(name = "IX_aligner_wear_session_date", columnList = "date")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerWearTimeSession extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_id")
    private Aligner aligner;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    private LocalTime endTime;

    private Long durationSecs;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    public void calculateDuration() {
        if (startTime != null && endTime != null) {
            Duration duration = Duration.between(startTime, endTime);
            this.durationSecs = duration.getSeconds();
            if (this.durationSecs < 0) {
                this.durationSecs = 86400 + this.durationSecs;
            }
        }
    }

    public boolean isActive() {
        return SessionStatus.ACTIVE.equals(status);
    }

    public boolean isCompleted() {
        return SessionStatus.COMPLETED.equals(status);
    }

    public enum SessionStatus {
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}
