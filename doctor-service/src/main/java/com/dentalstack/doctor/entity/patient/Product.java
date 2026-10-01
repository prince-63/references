package com.dentalstack.doctor.entity.patient;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.patient.ProductTypeName;
import com.dentalstack.doctor.enums.patient.TreatmentType;
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
