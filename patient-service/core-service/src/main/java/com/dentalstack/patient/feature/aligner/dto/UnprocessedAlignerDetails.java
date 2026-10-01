package com.dentalstack.patient.feature.aligner.dto;

import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import java.time.LocalDate;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnprocessedAlignerDetails {
    private LocalDate dueBy;
    private Integer totalAligners;
    private Integer upperAlignerStart;
    private Integer upperAlignerEnd;
    private Integer lowerAlignerStart;
    private Integer lowerAlignerEnd;
    private LocalDate reminderDate;
    private Long reminderId;
    private String treatmentVersion;

    public static UnprocessedAlignerDetails from(AlignerInfo batch, LocalDate dueDate) {
        return UnprocessedAlignerDetails.builder()
                .dueBy(dueDate)
                .totalAligners(batch.getCount())
                .upperAlignerStart(batch.getUpperRangeStart())
                .upperAlignerEnd(batch.getUpperRangeEnd())
                .lowerAlignerStart(batch.getLowerRangeStart())
                .lowerAlignerEnd(batch.getLowerRangeEnd())
                .build();
    }

    public static UnprocessedAlignerDetails from(
            AlignerInfo batch, LocalDate dueDate, @Nullable Reminder reminder, TreatmentPlan treatmentPlan) {
        return UnprocessedAlignerDetails.builder()
                .dueBy(dueDate)
                .totalAligners(batch.getCount())
                .upperAlignerStart(batch.getUpperRangeStart())
                .upperAlignerEnd(batch.getUpperRangeEnd())
                .lowerAlignerStart(batch.getLowerRangeStart())
                .lowerAlignerEnd(batch.getLowerRangeEnd())
                .reminderDate(reminder != null ? reminder.getDate() : null)
                .reminderId(reminder != null ? reminder.getId() : null)
                .treatmentVersion(treatmentPlan.getTreatmentPlanVersion())
                .build();
    }
}
