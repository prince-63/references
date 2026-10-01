package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerDetails;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderDeliveryPreference;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.patient.dto.PatientDetailsForWorkflow;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import com.dentalstack.patient.feature.storage.files.dto.OrderFileDetailsDTO;
import com.dentalstack.patient.feature.treatment.dto.BracesAlignerTreatmentResponse;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.Nullable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private String orderId;
    private PatientDetailsForWorkflow patientDetails;
    private CreateOrderDetails orderDetails;
    private PrescriptionDetails prescriptionDetails;
    private OrderFileDetailsDTO fileDetails;
    private List<BracesAlignerTreatmentResponse> treatmentPlanResponses;
    private List<OrderCommentsResponse> commentDetails;
    private Integer currentStep;
    private OrderStatus status;
    private String assignedLabUserName;
    private Long assignedLabUserId;
    private Long parentFileId;
    private Boolean isPurchaseOrder;
    private Boolean isPurchaseOrderTreatmentPlanIdsInDraft;
    private Integer purchaseOrderTreatmentPlanIdsCount;
    private Boolean isCustomerOrder;
    private Boolean isPracticeOrder;
    private String orderOwnerName;
    private Boolean showZipFile;

    private ManufacturingStatus manufacturingStatus;

    @Nullable
    private PurchaseOrderDetails purchaseOrderDetails;

    private ShippingDetailsRequest shippingDetails;
    private OrderDeliveryPreference deliveryPreference;
    private List<ManufacturingDetails> manufacturingDetails;
    private UnprocessedAlignerDetails unprocessedAlignerDetails;
    private String needMoreInfoRemark;
    private Boolean isNeedMoreInfoUpdated;
    private String cancelOrderRemark;
    private ZonedDateTime cancelledOn;
    private ZonedDateTime needMoreInfoUpdatedOn;
    private Boolean isNewOrder;
    private Long caseRecordId;
    private Long prescriptionId;
    private JsonNode serviceProducts;
    private String productType;
    private String productName;
    private String productDescription;
    private String productImage;
    private Boolean isCustomerTrackingEnabled;
    private Boolean isCustomerStlFileViewEnabled;
    private Boolean isCustomerPrintFileViewEnabled;
    private Boolean isCustomerScanFileViewEnabled;

    public static OrderResponse from(
            Order order,
            OrderFileDetailsDTO orderFileDetailsDTO,
            List<OrderCommentsResponse> orderCommentsResponse,
            List<BracesAlignerTreatmentResponse> treatmentPlanResponses,
            Long parentFileId,
            Long linkedOrderPlanCount,
            OrderRequest request,
            Boolean isCustomerOrder,
            String orderOwnerName,
            Boolean isPracticeOrder,
            LocalDate unprocessedAlignerDueDate,
            AtomicReference<Boolean> isCustomerTackingEnabled,
            AtomicReference<Boolean> isCustomerStlFileEnabled,
            AtomicReference<Boolean> isCustomerScanFileEnabled,
            AtomicReference<Boolean> isCustomerPrintFileEnabled) {

        boolean isPurchaseOrder =
                Objects.equals(request.getProfileId(), order.getOwnerProfile().getId());

        List<BracesAlignerTreatmentResponse> filteredTreatmentPlans = treatmentPlanResponses;

        if (isPurchaseOrder) {
            filteredTreatmentPlans = treatmentPlanResponses.stream()
                    .filter(plan -> plan.getInitiatorStatus() != OrderTreatmentPlanStatus.DRAFT
                            && plan.getInitiatorStatus() != OrderTreatmentPlanStatus.IN_PROGRESS
                            && plan.getApproverStatus() != OrderTreatmentPlanStatus.DRAFT
                            && plan.getApproverStatus() != OrderTreatmentPlanStatus.IN_PROGRESS)
                    .collect(Collectors.toList());
        }

        boolean hasTreatmentPlans = filteredTreatmentPlans != null && !filteredTreatmentPlans.isEmpty();

        boolean isPurchaseOrderTreatmentPlanIdsInDraft = false;

        if (hasTreatmentPlans) {
            long nonDraftPlans = filteredTreatmentPlans.stream()
                    .filter(plan -> plan.getInitiatorStatus() != OrderTreatmentPlanStatus.DRAFT
                            && plan.getApproverStatus() != OrderTreatmentPlanStatus.DRAFT)
                    .count();

            if (nonDraftPlans == 0) {
                isPurchaseOrderTreatmentPlanIdsInDraft = true;
            }
        }

        Order purchaseOrder = isPurchaseOrder ? order.getParentOrder() : order.getChildOrder();

        TreatmentPlan treatmentPlan = Optional.ofNullable(order.getManufacturingBatches())
                .filter(batches -> !batches.isEmpty())
                .map(batches -> batches.get(0))
                .map(ManufacturingBatch::getTreatmentPlan)
                .orElse(null);

        AlignerInfo totalAligners =
                treatmentPlan != null ? TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan) : null;

        AlignerInfo unprocessedAligner = Optional.ofNullable(totalAligners)
                .map(info -> ManufacturingBatch.calculatePendingAligners(
                        info,
                        order.getManufacturingBatches() != null
                                ? order.getManufacturingBatches()
                                : Collections.emptyList()))
                .orElse(null);

        return OrderResponse.builder()
                .doctorId(order.getDoctorId())
                .profileId(order.getProfileId())
                .organizationId(order.getOrganizationId())
                .orderId(order.getId())
                .patientDetails(PatientDetailsForWorkflow.from(order.getPatient()))
                .orderDetails(CreateOrderDetails.from(order))
                .prescriptionDetails(PrescriptionDetails.from(order.getPrescription()))
                .fileDetails(orderFileDetailsDTO)
                .commentDetails(orderCommentsResponse)
                .status(order.getStatus())
                .currentStep(order.getCurrentStep())
                .treatmentPlanResponses(filteredTreatmentPlans)
                .assignedLabUserId(order.getAssignedLabUserId())
                .assignedLabUserName(order.getAssignedLabUserName())
                .parentFileId(parentFileId)
                .isPurchaseOrder(isPurchaseOrder)
                .isPurchaseOrderTreatmentPlanIdsInDraft(isPurchaseOrderTreatmentPlanIdsInDraft)
                .purchaseOrderTreatmentPlanIdsCount(
                        Math.toIntExact(linkedOrderPlanCount) != 0 ? Math.toIntExact(linkedOrderPlanCount) : null)
                .purchaseOrderDetails(purchaseOrder != null ? PurchaseOrderDetails.from(purchaseOrder) : null)
                .isCustomerOrder(isCustomerOrder)
                .isPracticeOrder(isPracticeOrder)
                .orderOwnerName(orderOwnerName)
                .shippingDetails(
                        order.getShippingDetails() != null
                                ? ShippingDetailsRequest.from(order.getShippingDetails())
                                : null)
                .deliveryPreference(order.getDeliveryPreference())
                .manufacturingDetails(
                        order.getManufacturingBatches() != null
                                ? order.getManufacturingBatches().stream()
                                        .map(ManufacturingDetails::from)
                                        .collect(Collectors.toList())
                                : List.of())
                .manufacturingStatus(
                        order.getManufacturingBatches() != null
                                        && !order.getManufacturingBatches().isEmpty()
                                ? order.getManufacturingBatches().stream()
                                        .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                                        .map(ManufacturingBatch::getStatus)
                                        .orElse(ManufacturingStatus.MANUFACTURING_PENDING)
                                : ManufacturingStatus.MANUFACTURING_PENDING)
                .unprocessedAlignerDetails(
                        unprocessedAligner != null
                                ? UnprocessedAlignerDetails.from(unprocessedAligner, unprocessedAlignerDueDate)
                                : null)
                .needMoreInfoRemark(order.getNeedMoreInfoRemark())
                .isNeedMoreInfoUpdated(order.getIsNeedMoreInfoUpdated())
                .cancelOrderRemark(order.getCancelOrderRemark())
                .cancelledOn(order.getCancelledOn())
                .needMoreInfoUpdatedOn(order.getNeedMoreInfoUpdatedOn())
                .isNewOrder(order.getIsNewOrder())
                .caseRecordId(order.getCaseRecordId() != null ? order.getCaseRecordId() : null)
                .prescriptionId(
                        order.getPrescription() != null
                                ? order.getPrescription().getId()
                                : null)
                .serviceProducts(order.getServiceProducts())
                .productName(
                        order.getServiceProduct() != null
                                ? order.getServiceProduct().getProductName()
                                : null)
                .productDescription(
                        order.getServiceProduct() != null
                                ? order.getServiceProduct().getProductDescription()
                                : null)
                .productType(
                        order.getServiceProduct() != null
                                ? order.getServiceProduct().getProductType()
                                : null)
                .productImage(
                        order.getServiceProduct() != null
                                ? order.getServiceProduct().getProductImage()
                                : null)
                .isCustomerTrackingEnabled(isCustomerTackingEnabled.get())
                .isCustomerStlFileViewEnabled(isCustomerStlFileEnabled.get())
                .isCustomerPrintFileViewEnabled(isCustomerPrintFileEnabled.get())
                .isCustomerScanFileViewEnabled(isCustomerScanFileEnabled.get())
                .build();
    }

    public static OrderResponse from(Order order) {
        TreatmentPlan treatmentPlan = Optional.ofNullable(order.getManufacturingBatches())
                .filter(batches -> !batches.isEmpty())
                .map(batches -> batches.get(0))
                .map(ManufacturingBatch::getTreatmentPlan)
                .orElse(null);

        AlignerInfo totalAligners =
                treatmentPlan != null ? TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan) : null;

        AlignerInfo unprocessedAligner = Optional.ofNullable(totalAligners)
                .map(info -> ManufacturingBatch.calculatePendingAligners(
                        info,
                        order.getManufacturingBatches() != null
                                ? order.getManufacturingBatches()
                                : Collections.emptyList()))
                .orElse(null);

        return OrderResponse.builder()
                .doctorId(order.getDoctorId())
                .profileId(order.getProfileId())
                .organizationId(order.getOrganizationId())
                .orderId(order.getId())
                .patientDetails(PatientDetailsForWorkflow.from(order.getPatient()))
                .orderDetails(CreateOrderDetails.from(order))
                .prescriptionDetails(PrescriptionDetails.from(order.getPrescription()))
                .status(order.getStatus())
                .currentStep(order.getCurrentStep())
                .assignedLabUserId(order.getAssignedLabUserId())
                .assignedLabUserName(order.getAssignedLabUserName())
                .shippingDetails(
                        order.getShippingDetails() != null
                                ? ShippingDetailsRequest.from(order.getShippingDetails())
                                : null)
                .deliveryPreference(order.getDeliveryPreference())
                .manufacturingDetails(
                        order.getManufacturingBatches() != null
                                ? order.getManufacturingBatches().stream()
                                        .map(ManufacturingDetails::from)
                                        .collect(Collectors.toList())
                                : List.of())
                .manufacturingStatus(
                        order.getManufacturingBatches() != null
                                        && !order.getManufacturingBatches().isEmpty()
                                ? order.getManufacturingBatches().stream()
                                        .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                                        .map(ManufacturingBatch::getStatus)
                                        .orElse(ManufacturingStatus.MANUFACTURING_PENDING)
                                : ManufacturingStatus.MANUFACTURING_PENDING)
                .needMoreInfoRemark(order.getNeedMoreInfoRemark())
                .isNeedMoreInfoUpdated(order.getIsNeedMoreInfoUpdated())
                .cancelOrderRemark(order.getCancelOrderRemark())
                .cancelledOn(order.getCancelledOn())
                .needMoreInfoUpdatedOn(order.getNeedMoreInfoUpdatedOn())
                .isNewOrder(order.getIsNewOrder())
                .caseRecordId(order.getCaseRecordId() != null ? order.getCaseRecordId() : null)
                .prescriptionId(
                        order.getPrescription().getId() != null
                                ? order.getPrescription().getId()
                                : null)
                .serviceProducts(order.getServiceProducts())
                .build();
    }
}
