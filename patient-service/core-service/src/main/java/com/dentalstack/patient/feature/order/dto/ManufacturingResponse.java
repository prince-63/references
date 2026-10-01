package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ManufacturingResponse {
    private ManufacturingStatus status;
    private String shippingDate;
    private String tentativeDeliveryDate;
    private String deliveryDate;
    private String trackingNumber;
    private String trackingLink;
    private Boolean isCurrent;
    private List<FileDetails> documents;
    private Long manufacturingBatchId;

    private LocalDate startedOn;
    private Long id;
    private LocalDate completedOn;
    private LocalDate shippedOn;
    private BatchType batchType;
    private Integer totalAligners;
    private Integer upperAlignerStart;
    private Integer upperAlignerEnd;
    private Integer lowerAlignerStart;
    private Integer lowerAlignerEnd;
    private LocalDate deliveredOn;
    private String notes;
    private LocalDate dueDate;
    private Boolean isAlreadyDelivered;
    private Boolean isShowMarkAsReceived;
    private LocalDate shippingAddedOn;
    private String instructions;
    private String assignee;
    private String createdBy;
    private JsonNode serviceProducts;
    private Integer batchNumber;
    private String productType;
    private String productName;
    private String productDescription;
    private String productImage;

    private CurrentManufacturingCounts currentManufacturingCounts;
    private String outsourcedTo;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CurrentManufacturingCounts implements Serializable {
        private Integer totalAlignersCounts;
        private Integer inManufacturingCount;
        private Integer unprocessedCounts;
        private Integer deliveredCounts;
    }

    public static ManufacturingResponse createManufacturingResponse(ManufacturingBatch manufacturingBatch) {
        String createdBy = null;
        String assignee = null;
        PatientTaskTracker patientTaskTracker = manufacturingBatch.getPatientTaskTracker();
        if (patientTaskTracker != null) {
            if (patientTaskTracker.getCreatedByProfile() != null) {
                createdBy = patientTaskTracker.getCreatedByProfile().getUser().fullNameWithSalutation();
            }
            if (patientTaskTracker.getAssignee() != null) {
                assignee = patientTaskTracker.getAssignee().getUser().fullNameWithSalutation();
            }
        }

        return ManufacturingResponse.builder()
                .status(manufacturingBatch.getStatus())
                .shippingDate(
                        manufacturingBatch.getShippingDate() != null
                                ? manufacturingBatch.getShippingDate().toString()
                                : null)
                .tentativeDeliveryDate(
                        manufacturingBatch.getTentativeDeliveryDate() != null
                                ? manufacturingBatch.getTentativeDeliveryDate().toString()
                                : null)
                .deliveryDate(
                        manufacturingBatch.getDeliveryDate() != null
                                ? manufacturingBatch.getDeliveryDate().toString()
                                : null)
                .trackingNumber(manufacturingBatch.getTrackingNumber())
                .trackingLink(manufacturingBatch.getTrackingLink())
                .isCurrent(manufacturingBatch.getIsCurrent())
                .documents(manufacturingBatch.getFiles().stream()
                        .map(FileDetails::from)
                        .toList())
                .manufacturingBatchId(manufacturingBatch.getId())
                .id(manufacturingBatch.getId())
                .status(manufacturingBatch.getStatus())
                .startedOn(manufacturingBatch.getStartDate() != null ? manufacturingBatch.getStartDate() : null)
                .completedOn(
                        manufacturingBatch.getCompletionDate() != null ? manufacturingBatch.getCompletionDate() : null)
                .shippedOn(manufacturingBatch.getShippingDate() != null ? manufacturingBatch.getShippingDate() : null)
                .deliveredOn(manufacturingBatch.getDeliveryDate() != null ? manufacturingBatch.getDeliveryDate() : null)
                .batchType(manufacturingBatch.getBatchType())
                .totalAligners(manufacturingBatch.getTotalAligners())
                .upperAlignerStart(manufacturingBatch.getUpperAlignerStart())
                .upperAlignerEnd(manufacturingBatch.getUpperAlignerEnd())
                .lowerAlignerStart(manufacturingBatch.getLowerAlignerStart())
                .lowerAlignerEnd(manufacturingBatch.getLowerAlignerEnd())
                .trackingNumber(manufacturingBatch.getTrackingNumber())
                .trackingLink(manufacturingBatch.getTrackingLink())
                .isAlreadyDelivered(manufacturingBatch.getAlreadyDelivered())
                .isShowMarkAsReceived(manufacturingBatch.getIsShowMarkAsReceived())
                .shippingAddedOn(manufacturingBatch.getShippingAddedOn())
                .instructions(manufacturingBatch.getInstructions())
                .createdBy(createdBy)
                .assignee(assignee)
                .serviceProducts(manufacturingBatch.getServiceProducts())
                .batchNumber(manufacturingBatch.getBatchNumber())
                .productType(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductType()
                                : null)
                .productName(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductName()
                                : null)
                .productDescription(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductDescription()
                                : null)
                .productImage(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductImage()
                                : null)
                .build();
    }

    public static ManufacturingResponse createManufacturingResponseService(ManufacturingBatch manufacturingBatch) {
        String createdBy = null;
        String assignee = null;
        PatientTaskTracker patientTaskTracker = manufacturingBatch.getPatientTaskTracker();
        if (patientTaskTracker != null) {
            if (patientTaskTracker.getCreatedByProfile() != null) {
                createdBy = patientTaskTracker.getCreatedByProfile().getUser().fullNameWithSalutation();
            }
            if (patientTaskTracker.getAssignee() != null) {
                assignee = patientTaskTracker.getAssignee().getUser().fullNameWithSalutation();
            }
        }

        JsonNode serviceProductsJson = null;
        if (manufacturingBatch.getServiceProduct() != null) {

            serviceProductsJson = manufacturingBatch.getServiceProduct().toJsonNode();
        } else {

            serviceProductsJson = manufacturingBatch.getServiceProducts();
        }

        return ManufacturingResponse.builder()
                .status(manufacturingBatch.getStatus())
                .shippingDate(
                        manufacturingBatch.getShippingDate() != null
                                ? manufacturingBatch.getShippingDate().toString()
                                : null)
                .tentativeDeliveryDate(
                        manufacturingBatch.getTentativeDeliveryDate() != null
                                ? manufacturingBatch.getTentativeDeliveryDate().toString()
                                : null)
                .deliveryDate(
                        manufacturingBatch.getDeliveryDate() != null
                                ? manufacturingBatch.getDeliveryDate().toString()
                                : null)
                .trackingNumber(manufacturingBatch.getTrackingNumber())
                .trackingLink(manufacturingBatch.getTrackingLink())
                .isCurrent(manufacturingBatch.getIsCurrent())
                .documents(manufacturingBatch.getFiles().stream()
                        .map(FileDetails::from)
                        .toList())
                .manufacturingBatchId(manufacturingBatch.getId())
                .id(manufacturingBatch.getId())
                .status(manufacturingBatch.getStatus())
                .startedOn(manufacturingBatch.getStartDate() != null ? manufacturingBatch.getStartDate() : null)
                .completedOn(
                        manufacturingBatch.getCompletionDate() != null ? manufacturingBatch.getCompletionDate() : null)
                .shippedOn(manufacturingBatch.getShippingDate() != null ? manufacturingBatch.getShippingDate() : null)
                .deliveredOn(manufacturingBatch.getDeliveryDate() != null ? manufacturingBatch.getDeliveryDate() : null)
                .batchType(manufacturingBatch.getBatchType())
                .totalAligners(manufacturingBatch.getTotalAligners())
                .upperAlignerStart(manufacturingBatch.getUpperAlignerStart())
                .upperAlignerEnd(manufacturingBatch.getUpperAlignerEnd())
                .lowerAlignerStart(manufacturingBatch.getLowerAlignerStart())
                .lowerAlignerEnd(manufacturingBatch.getLowerAlignerEnd())
                .trackingNumber(manufacturingBatch.getTrackingNumber())
                .trackingLink(manufacturingBatch.getTrackingLink())
                .isAlreadyDelivered(manufacturingBatch.getAlreadyDelivered())
                .isShowMarkAsReceived(manufacturingBatch.getIsShowMarkAsReceived())
                .shippingAddedOn(manufacturingBatch.getShippingAddedOn())
                .instructions(manufacturingBatch.getInstructions())
                .createdBy(createdBy)
                .assignee(assignee)
                .serviceProducts(serviceProductsJson)
                .batchNumber(manufacturingBatch.getBatchNumber())
                .productType(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductType()
                                : null)
                .productName(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductName()
                                : null)
                .productDescription(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductDescription()
                                : null)
                .productImage(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductImage()
                                : null)
                .build();
    }

    public static ManufacturingResponse createManufacturingResponse(
            ManufacturingBatch manufacturingBatch,
            Integer manufacturingCount,
            Integer unprocessedCount,
            Integer deliveredCount,
            Integer totalAlignerCounts) {
        String assignee = null;
        PatientTaskTracker patientTaskTracker = manufacturingBatch.getPatientTaskTracker();
        if (patientTaskTracker != null) {
            if (patientTaskTracker.getAssignee() != null) {
                assignee = patientTaskTracker.getAssignee().getUser().fullNameWithSalutation();
            }
        }
        return ManufacturingResponse.builder()
                .status(manufacturingBatch.getStatus())
                .shippingDate(
                        manufacturingBatch.getShippingDate() != null
                                ? manufacturingBatch.getShippingDate().toString()
                                : null)
                .tentativeDeliveryDate(
                        manufacturingBatch.getTentativeDeliveryDate() != null
                                ? manufacturingBatch.getTentativeDeliveryDate().toString()
                                : null)
                .deliveryDate(
                        manufacturingBatch.getDeliveryDate() != null
                                ? manufacturingBatch.getDeliveryDate().toString()
                                : null)
                .trackingNumber(manufacturingBatch.getTrackingNumber())
                .trackingLink(manufacturingBatch.getTrackingLink())
                .isCurrent(manufacturingBatch.getIsCurrent())
                .documents(manufacturingBatch.getFiles().stream()
                        .map(FileDetails::from)
                        .toList())
                .manufacturingBatchId(manufacturingBatch.getId())
                .id(manufacturingBatch.getId())
                .status(manufacturingBatch.getStatus())
                .startedOn(manufacturingBatch.getStartDate() != null ? manufacturingBatch.getStartDate() : null)
                .completedOn(
                        manufacturingBatch.getCompletionDate() != null ? manufacturingBatch.getCompletionDate() : null)
                .shippedOn(manufacturingBatch.getShippingDate() != null ? manufacturingBatch.getShippingDate() : null)
                .deliveredOn(manufacturingBatch.getDeliveryDate() != null ? manufacturingBatch.getDeliveryDate() : null)
                .batchType(manufacturingBatch.getBatchType())
                .totalAligners(manufacturingBatch.getTotalAligners())
                .upperAlignerStart(manufacturingBatch.getUpperAlignerStart())
                .upperAlignerEnd(manufacturingBatch.getUpperAlignerEnd())
                .lowerAlignerStart(manufacturingBatch.getLowerAlignerStart())
                .lowerAlignerEnd(manufacturingBatch.getLowerAlignerEnd())
                .trackingNumber(manufacturingBatch.getTrackingNumber())
                .trackingLink(manufacturingBatch.getTrackingLink())
                .currentManufacturingCounts(CurrentManufacturingCounts.builder()
                        .inManufacturingCount(manufacturingCount)
                        .deliveredCounts(deliveredCount)
                        .unprocessedCounts(unprocessedCount)
                        .totalAlignersCounts(totalAlignerCounts)
                        .build())
                .isAlreadyDelivered(manufacturingBatch.getAlreadyDelivered())
                .isShowMarkAsReceived(manufacturingBatch.getIsShowMarkAsReceived())
                .shippingAddedOn(manufacturingBatch.getShippingAddedOn())
                .createdBy(manufacturingBatch
                        .getManufacturingOwnerProfile()
                        .getUser()
                        .fullNameWithSalutation())
                .assignee(assignee)
                .serviceProducts(manufacturingBatch.getServiceProducts())
                .batchNumber(manufacturingBatch.getBatchNumber())
                .instructions(manufacturingBatch.getInstructions())
                .productType(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductType()
                                : null)
                .productName(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductName()
                                : null)
                .productDescription(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductDescription()
                                : null)
                .productImage(
                        manufacturingBatch.getServiceProduct() != null
                                ? manufacturingBatch.getServiceProduct().getProductImage()
                                : null)
                .outsourcedTo(
                        manufacturingBatch.getOutsourcedTo() != null
                                ? manufacturingBatch.getOutsourcedTo().getOrgName()
                                : null)
                .build();
    }
}
