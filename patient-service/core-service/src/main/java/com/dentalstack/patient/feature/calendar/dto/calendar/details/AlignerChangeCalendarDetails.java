package com.dentalstack.patient.feature.calendar.dto.calendar.details;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlignerChangeCalendarDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String patientName;
    private String profileUrl;
    private JawType previousAlignerJawType;
    private JawType currentAlignerJawType;
    private int previousAlignerNumber;
    private int currentAlignerNumber;
    private LocalDate recommendedDateOfChange;
    private int daysDelayOffset;
    private boolean isCheckInPerformed;
    private boolean isManual;
    private long patientId;
    private long alignerJourneyId;
    private Long alignerActionId;

    public static AlignerChangeCalendarDetails from(
            String patientName,
            String profileUrl,
            JawType previousAlignerJawType,
            JawType currentAlignerJawType,
            int previousAlignerNumber,
            int currentAlignerNumber,
            LocalDate recommendedDateOfChange,
            int daysDelay,
            Boolean isCheckInPerformed,
            boolean isManual,
            long patientId,
            long alignerJourneyId,
            Long alignerActionId) {

        return AlignerChangeCalendarDetails.builder()
                .patientName(patientName)
                .profileUrl(profileUrl)
                .previousAlignerJawType(previousAlignerJawType)
                .currentAlignerJawType(currentAlignerJawType)
                .previousAlignerNumber(previousAlignerNumber)
                .currentAlignerNumber(currentAlignerNumber)
                .recommendedDateOfChange(recommendedDateOfChange)
                .daysDelayOffset(daysDelay)
                .isCheckInPerformed(isCheckInPerformed != null ? isCheckInPerformed : false)
                .isManual(isManual)
                .alignerJourneyId(alignerJourneyId)
                .patientId(patientId)
                .alignerActionId(alignerActionId)
                .build();
    }
}
