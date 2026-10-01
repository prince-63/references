package com.dentalstack.patient.feature.reminder.dto;

import static com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType.ALIGNER_CHANGE_DATE;

import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SetDefaultReminderRequest {
    private String name;
    private Long alignerJourneyId;

    @Schema(implementation = String.class, pattern = "HH:mm:SS")
    private LocalTime time;

    private DefaultAlignerReminderType defaultAlignerReminderType;

    public static SetDefaultReminderRequest from(Long alignerJourneyId, String name, LocalTime time) {
        return SetDefaultReminderRequest.builder()
                .alignerJourneyId(alignerJourneyId)
                .name(name)
                .time(time)
                .defaultAlignerReminderType(ALIGNER_CHANGE_DATE)
                .build();
    }
}
