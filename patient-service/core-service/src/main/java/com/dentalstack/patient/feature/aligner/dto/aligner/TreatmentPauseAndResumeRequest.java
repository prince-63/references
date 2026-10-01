package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.tracking.enums.Status;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentPauseAndResumeRequest {

    private int alignerJourneyId;
    private Status treatmentState;
    private LocalDate resumeDate;
    private String reasonForPausing;
    private Integer wearDays;
    private LocalDate startDate;
    private Integer alignerNo;
    private Long profileId;
}
