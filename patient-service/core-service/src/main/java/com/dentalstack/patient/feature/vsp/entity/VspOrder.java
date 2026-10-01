package com.dentalstack.patient.feature.vsp.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.global.entity.NewBaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "vsp_order",
        indexes = {
            @Index(name = "IX_vsp_order_patient_id", columnList = "patient_id"),
            @Index(name = "IX_vsp_order_created_by_user_profile_id", columnList = "created_by_user_profile_id"),
            @Index(name = "IX_vsp_order_assigned_to_user_profile_id", columnList = "assigned_to_user_profile_id"),
            @Index(name = "IX_vsp_order_status", columnList = "status")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VspOrder extends NewBaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @ToString.Exclude
    private Patient patient;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_profile_id", nullable = false)
    @ToString.Exclude
    private UserProfile createdByUserProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_profile_id")
    @ToString.Exclude
    private UserProfile assignedToUserProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_product_id")
    @ToString.Exclude
    private ServiceProduct serviceProduct;

    @NotNull
    @Enumerated(EnumType.STRING)
    private VspOrderStatus status;

    private String oralSurgeonName;
    private String orthodontistName;

    @Column(columnDefinition = "TEXT")
    private String notesForLab;

    @OneToMany(mappedBy = "vspOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<VspCaseRecord> caseRecords = new ArrayList<>();

    @OneToMany(mappedBy = "vspOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<VspPrescription> prescriptions = new ArrayList<>();

    @OneToMany(mappedBy = "vspOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<VspTreatmentPlan> treatmentPlans = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_shipping_details_id")
    private VspShippingDetails shippingDetails;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "vsp_billing_details_id")
    private VspBillingDetails billingDetails;
}
