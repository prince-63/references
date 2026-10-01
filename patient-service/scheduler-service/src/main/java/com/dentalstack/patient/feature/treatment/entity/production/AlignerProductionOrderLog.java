package com.dentalstack.patient.feature.treatment.entity.production;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "aligner_production_order_log",
        indexes = {
            @Index(name = "IX_log_production_order_id", columnList = "aligner_production_order_id") // Foreign key index
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerProductionOrderLog extends BaseEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int srNo;

    @Builder.Default
    @OneToMany(mappedBy = "alignerProductionOrderLog", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<AlignerProductionLog> alignerProductionLogs = new ArrayList<>();

    @NotNull
    @ManyToOne
    @JoinColumn(name = "aligner_production_order_id")
    private AlignerProductionOrder alignerProductionOrder;

    public static AlignerProductionOrderLog newLog(int srNo, AlignerProductionOrder order) {
        return AlignerProductionOrderLog.builder()
                .srNo(srNo)
                .alignerProductionOrder(order)
                .build();
    }
}
