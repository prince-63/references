package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.global.config.TimezoneConfig;
import java.time.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ForceAlignerChangeResponse {
    private int changeFrom;
    private int changedTo;
    private LocalDate alignerChangeDate;
    private LocalTime alignerChangeTime;
    private JawType previousJawType;
    private JawType currentJawType;
    private ZonedDateTime alignerChangeDateTime;

    public static ForceAlignerChangeResponse from(AlignerJourney alignerJourney) {
        var currentAligner = alignerJourney.getCurrentAligner();
        assert currentAligner != null;
        var previousAligner = alignerJourney.getAligner(currentAligner.getSrNo() - 1);

        LocalDateTime localDateTime = LocalDateTime.of(previousAligner.getChangeDate(), previousAligner.getTime());
        ZoneId fixedZone = TimezoneConfig.DEFAULT_ZONE_ID;
        ZonedDateTime zonedDateTime = localDateTime.atZone(fixedZone);

        return ForceAlignerChangeResponse.builder()
                .changeFrom(currentAligner.getSrNo() - 1)
                .changedTo(alignerJourney.getCurrentAlignerNo())
                .alignerChangeDate(previousAligner.getChangeDate())
                .alignerChangeTime(previousAligner.getTime())
                .previousJawType(previousAligner.getJawType())
                .currentJawType(currentAligner.getJawType())
                .alignerChangeDateTime(zonedDateTime)
                .build();
    }
}
