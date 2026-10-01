package com.dentalstack.patient.feature.aligner.entity.production;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.OrderStatus;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "aligner_production_order",
        indexes = {
            @Index(name = "IX_aligner_production_order_status", columnList = "status"),
            @Index(name = "IX_journey_id_status", columnList = "aligner_journey_id, status")
        })
@Getter
@Setter
@ToString(exclude = {"alignerProductions", "reminders", "logs", "alignerJourney"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class AlignerProductionOrder extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Builder.Default
    @OneToMany(mappedBy = "alignerProductionOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AlignerProduction> alignerProductions = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "alignerProductionOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AlignerProductionOrderLog> logs = new ArrayList<>();

    @ManyToOne
    @NotNull
    @JoinColumn(name = "aligner_journey_id")
    private AlignerJourney alignerJourney;

    @OneToMany(targetEntity = Reminder.class, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "aligner_production_order_reminder")
    private List<Reminder> reminders;

    public static AlignerProductionOrder forNewTreatment(AlignerJourney alignerJourney) {
        return AlignerProductionOrder.builder()
                .alignerJourney(alignerJourney)
                .status(OrderStatus.ACTIVE)
                .build();
    }
}
