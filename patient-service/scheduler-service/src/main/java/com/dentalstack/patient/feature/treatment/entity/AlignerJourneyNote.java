package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "aligner_journey_note")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class AlignerJourneyNote extends BaseEntity {

    @NotNull
    private String title;

    @Column(columnDefinition = "TEXT")
    private String text;

    @NotNull
    private long addedBy;

    @NotNull
    private UserType addedByUserType;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;

    @Builder.Default
    private boolean active = true;
}
