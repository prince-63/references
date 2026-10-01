package com.dentalstack.patient.feature.aligner.dto.alignertreatment;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TreatmentDetails {

    private LocalDate pauseDate;
    private Integer daysRemainingOnCurrentAligner;
    private Integer noOfDaysTreatmentWasPausedFor;
    private LocalDate resumeDate;
    private Integer nextAligner;
    private Integer currentAlignerNumber;
    private JawType nextAlignerJawType;
    private JawType currentAlignerJawType;
}
