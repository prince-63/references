package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerData {
    private Long alignerId;
    private int alignerNumber;
    private int totalAligner;
    private Integer overDue;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isAlignerChanged;
    private Long patientId;
    private Long alignerJourneyId;
    private JawType jawType;
    private JawType currentAlignerJawType;
    private int currentAlignerNumber;
    private boolean isAlignerChangeApproved;
    private List<AlignerActionData> actions;
    private Integer pendingActionsCount;
    private JawType previousJawType;
    private int previousAlignerNumber;
    private Boolean moveToPreviousAlignerEnable;
}
