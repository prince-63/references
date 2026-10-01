package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.global.entity.NewBaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "vsp_production_shipping")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspProductionShipping extends NewBaseEntity {

    private String trackingNumber;

    @OneToOne(mappedBy = "shipping", fetch = FetchType.LAZY)
    @ToString.Exclude
    private VspProduction vspProduction;

    private LocalDate tentativeDate;
    private String trackingLink;
    private LocalDate shippingDate;
}
