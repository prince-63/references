package com.dentalstack.patient.feature.producttype.entity;

import com.dentalstack.patient.feature.braces.dto.CreateBracesJourneyRequest;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.treatment.dto.AddTreatmentRequest;
import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.ProductTypeName;
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

    @ManyToOne(fetch = FetchType.LAZY)
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

    public static Product from(AddTreatmentRequest addTreatmentRequest) {
        return Product.builder()
                .patientId(addTreatmentRequest.getPatientId())
                .doctorId(addTreatmentRequest.getDoctorId())
                .type(addTreatmentRequest.getTreatmentType())
                .subType(addTreatmentRequest.getTreatmentSubType())
                .build();
    }

    public static Product from(TreatmentPlanRequest addTreatmentRequest) {
        return Product.builder()
                .patientId(addTreatmentRequest.getPatientId())
                .doctorId(addTreatmentRequest.getDoctorId())
                .type(TreatmentType.ORTHOTRACKER)
                .subType(ProductTypeName.ALIGNERS)
                .build();
    }

    public static Product from(CreateBracesJourneyRequest addTreatmentRequest) {
        return Product.builder()
                .patientId(addTreatmentRequest.getPatientId())
                .doctorId(addTreatmentRequest.getDoctorId())
                .type(TreatmentType.ORTHOTRACKER)
                .subType(ProductTypeName.BRACES)
                .build();
    }
}
