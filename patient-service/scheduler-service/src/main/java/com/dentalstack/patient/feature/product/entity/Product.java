package com.dentalstack.patient.feature.product.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "product")
public class Product extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "patient_id")
    private Long patientId;

    private Long doctorId;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private TreatmentType type;

    @Column(name = "subtype")
    @Enumerated(EnumType.STRING)
    private ProductTypeName subType;
}
