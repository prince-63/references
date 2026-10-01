package com.dentalstack.patient.feature.order.entity;

import com.dentalstack.patient.feature.order.dto.ShippingDetails;
import com.dentalstack.patient.feature.order.dto.v2.CloneOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.CreateOrderRequestV2;
import com.dentalstack.patient.feature.order.enums.OrderDeliveryPreference;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.global.entity.NewBaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "orders",
        indexes = {
            @Index(name = "idx_order_doctor_profile_org", columnList = "doctorId, profileId, organizationId"),
            @Index(name = "idx_order_doctor_org", columnList = "organizationId, doctorId"),
            @Index(name = "idx_order_patient", columnList = "patient_id"),
            @Index(name = "idx_order_owner_profile", columnList = "owner_profile_id"),
            @Index(name = "idx_order_target_profile", columnList = "target_profile_id"),
            @Index(name = "idx_order_parent", columnList = "parent_order_id")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends NewBaseEntity {
    @NotNull
    private Long doctorId;

    @NotNull
    private Long profileId;

    @NotNull
    private Long organizationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    private Long labId;
    private String labName;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    private LocalDate dueBy;
    private Boolean isUrgent;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    private Long caseRecordId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Integer currentStep;

    private String assignedLabUserName;

    private Long assignedLabUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_profile_id")
    private UserProfile ownerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_profile_id")
    private UserProfile targetProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_profile_id")
    private UserProfile createdByProfile;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_order_id")
    private Order parentOrder;

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_order_id")
    private Order childOrder;

    private Boolean showZipFile;

    @Enumerated(EnumType.STRING)
    private OrderDeliveryPreference deliveryPreference;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ManufacturingBatch> manufacturingBatches;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_details_id")
    private ShippingDetails shippingDetails;

    @Column(columnDefinition = "TEXT")
    private String needMoreInfoRemark;

    private Boolean isNeedMoreInfoUpdated;

    @Column(columnDefinition = "TEXT")
    private String cancelOrderRemark;

    private ZonedDateTime cancelledOn;
    private ZonedDateTime needMoreInfoUpdatedOn;
    private Boolean isNewOrder;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode serviceProducts;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_product_id", referencedColumnName = "id")
    private ServiceProduct serviceProduct;

    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @Builder.Default
    private Boolean caseSubmitted = false;

    public static Order from(
            Order existingOrder, UserProfile ownerProfile, UserProfile targetProfile, OrderType orderType) {
        return Order.builder()
                .patient(existingOrder.getPatient())
                .currentStep(existingOrder.getCurrentStep())
                .doctorId(existingOrder.getDoctorId())
                .profileId(existingOrder.getProfileId())
                .organizationId(existingOrder.getOrganizationId())
                .labId(existingOrder.getLabId())
                .labName(existingOrder.getLabName())
                .dueBy(existingOrder.getDueBy())
                .isUrgent(existingOrder.getIsUrgent())
                .orderType(orderType != null ? orderType : existingOrder.getOrderType())
                .status(existingOrder.getStatus())
                .assignedLabUserId(existingOrder.getAssignedLabUserId())
                .assignedLabUserName(existingOrder.getAssignedLabUserName())
                .ownerProfile(ownerProfile)
                .targetProfile(targetProfile != null ? targetProfile : existingOrder.getTargetProfile())
                .createdByProfile(ownerProfile)
                .parentOrder(existingOrder)
                .showZipFile(true)
                .deliveryPreference(existingOrder.getDeliveryPreference())
                .taskType(existingOrder.getTaskType())
                .serviceProducts(existingOrder.getServiceProducts())
                .build();
    }

    public static Order cloneOrder(
            Order existingOrder,
            UserProfile ownerProfile,
            UserProfile targetProfile,
            OrderType orderType,
            CloneOrderRequestV2 request) {
        return Order.builder()
                .patient(existingOrder.getPatient())
                .currentStep(existingOrder.getCurrentStep())
                .doctorId(existingOrder.getDoctorId())
                .profileId(existingOrder.getProfileId())
                .organizationId(existingOrder.getOrganizationId())
                .labId(existingOrder.getLabId())
                .labName(existingOrder.getLabName())
                .dueBy(existingOrder.getDueBy())
                .isUrgent(existingOrder.getIsUrgent())
                .orderType(orderType != null ? orderType : existingOrder.getOrderType())
                .status(existingOrder.getStatus())
                .assignedLabUserId(existingOrder.getAssignedLabUserId())
                .assignedLabUserName(existingOrder.getAssignedLabUserName())
                .ownerProfile(ownerProfile)
                .targetProfile(targetProfile != null ? targetProfile : existingOrder.getTargetProfile())
                .createdByProfile(ownerProfile)
                .parentOrder(existingOrder)
                .showZipFile(true)
                .deliveryPreference(existingOrder.getDeliveryPreference())
                .taskType(existingOrder.getTaskType())
                .serviceProducts(
                        request.getServiceProducts() != null
                                ? request.getServiceProducts()
                                : existingOrder.getServiceProducts())
                .build();
    }

    public Long getOwnerProfileId() {
        return ownerProfile != null ? ownerProfile.getId() : null;
    }

    public Long getTargetProfileId() {
        return targetProfile != null ? targetProfile.getId() : null;
    }

    public Long getTargetProfileDoctorId() {
        return targetProfile != null
                ? targetProfile.getDoctor() != null ? targetProfile.getDoctor().getId() : null
                : null;
    }

    public String getTargetProfileName() {
        if (targetProfile == null) {
            return null;
        }
        return targetProfile.getDoctorBilling() != null
                ? targetProfile.getDoctorBilling().getCompanyBrandName()
                : targetProfile.getUser().fullName();
    }

    public static Order createNewOrder(
            CreateOrderRequestV2 request,
            Patient patient,
            UserProfile requestProfile,
            UserProfile ownerUserProfile,
            UserProfile receiverUserProfile,
            ServiceProduct serviceProduct) {
        Order order = new Order();

        order.setPatient(patient);

        ownerUserProfile.isEnterprise();

        order.setCurrentStep(request.getCurrentStep());
        order.setCreatedByProfile(requestProfile);
        order.setOwnerProfile(ownerUserProfile);
        order.setTargetProfile(receiverUserProfile);

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        if (request.getDeliveryPreference() != null) {
            order.setDeliveryPreference(request.getDeliveryPreference());
        }

        setOrderDetails(order, request);

        if (request.getCaseType() != null) {
            order.setTaskType(request.getCaseType());
        }

        if (request.getServiceProducts() != null) {
            order.setServiceProducts(request.getServiceProducts());
        }

        if (serviceProduct != null) {
            order.setServiceProduct(serviceProduct);
        }

        return order;
    }

    public static void updateExistingOrder(
            Order order,
            CreateOrderRequestV2 request,
            UserProfile requestProfile,
            UserProfile ownerUserProfile,
            UserProfile receiverUserProfile,
            ServiceProduct serviceProduct) {

        order.setCurrentStep(request.getCurrentStep());

        order.setCreatedByProfile(requestProfile);

        if (request.getOrderDetails() != null) {
            updateOrderDetails(order, request);

            if (request.getReceiverProfileId() != null) {
                order.setTargetProfile(receiverUserProfile);
            }
        }

        if (request.getCaseType() != null) {
            order.setTaskType(request.getCaseType());
        }

        if (request.getServiceProducts() != null) {
            order.setServiceProducts(request.getServiceProducts());
        }

        if (serviceProduct != null) {
            order.setServiceProduct(serviceProduct);
        }

        order.setOwnerProfile(ownerUserProfile);

        order.setStatus(request.getStatus());

        order.setDeliveryPreference(
                request.getDeliveryPreference() != null
                        ? request.getDeliveryPreference()
                        : order.getDeliveryPreference());
    }

    private static void setOrderDetails(Order order, CreateOrderRequestV2 request) {
        if (request.getOrderDetails() != null) {

            order.setDoctorId(request.getDoctorId());
            order.setProfileId(request.getProfileId());
            order.setOrganizationId(request.getOrganizationId());
            order.setLabId(request.getOrderDetails().getLabId());
            order.setLabName(request.getOrderDetails().getLabName());
            order.setDueBy(request.getOrderDetails().getDueBy());
            order.setIsUrgent(request.getOrderDetails().getIsUrgent());
            order.setOrderType(request.getOrderDetails().getOrderType());
        }
    }

    private static void updateOrderDetails(Order order, CreateOrderRequestV2 request) {

        order.setDoctorId(request.getDoctorId());
        order.setProfileId(request.getProfileId());
        order.setOrganizationId(request.getOrganizationId());
        order.setLabId(request.getOrderDetails().getLabId());
        order.setLabName(request.getOrderDetails().getLabName());
        order.setDueBy(request.getOrderDetails().getDueBy());
        order.setIsUrgent(request.getOrderDetails().getIsUrgent());
        order.setOrderType(request.getOrderDetails().getOrderType());
    }
}
