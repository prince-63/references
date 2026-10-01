package com.dentalstack.patient.feature.aligner.dto.aligner.production;

import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionOrder;
import com.dentalstack.patient.feature.aligner.enums.OrderStatus;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import java.io.Serial;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionOrderDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private OrderStatus status;

    private List<AlignerProductionDetails> alignerProductions;

    private List<ProductionOrderReminderDetails> reminders;

    public static AlignerProductionOrderDetails from(AlignerProductionOrder alignerProductionOrder) {
        return AlignerProductionOrderDetails.builder()
                .status(alignerProductionOrder.getStatus())
                .alignerProductions(alignerProductionOrder.getAlignerProductions().stream()
                        .map(AlignerProductionDetails::from)
                        .toList())
                .reminders(
                        alignerProductionOrder.getReminders() == null
                                ? Collections.emptyList()
                                : alignerProductionOrder.getReminders().stream()
                                        .filter(r -> r.getStatus().equals(ReminderStatus.ACTIVE))
                                        .map(ProductionOrderReminderDetails::from)
                                        .toList())
                .build();
    }
}
