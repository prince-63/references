package com.dentalstack.patient.feature.aligner.entity;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class LeadAligner {

    private int srNo;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate changeDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private JawType jawType;

    private int noOfDaysToWear;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;
}
