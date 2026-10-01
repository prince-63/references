package com.dentalstack.patient.feature.aligner.dto.aligner.production;

import com.dentalstack.patient.feature.reminder.entity.ProdutionReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductionOrderReminderDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private long reminderId;
    private LocalDate remindAt;
    private String title;
    private String notes;
    private LocalTime time;

    public static ProductionOrderReminderDetails from(Reminder reminder) {

        var metadata = (ProdutionReminderMetadata) reminder.getMetadata();
        return new ProductionOrderReminderDetails(
                reminder.getId(), reminder.getDate(), reminder.getTitle(), metadata.getNotes(), reminder.getTime());
    }
}
