package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspOrderResponse {
    private String orderId;
    private Long patientId;
    private String patientName;
    private String gender;
    private Integer age;
    private String customerMappedId;
    private Long createdByUserProfileId;
    private Long assignedToUserProfileId;
    private Long serviceProductId;
    private String serviceProductName;
    private VspOrderStatus status;
    private String oralSurgeonName;
    private String orthodontistName;
    private String notesForLab;

    private List<VspCaseRecordResponse> caseRecords;
    private List<VspPrescriptionResponse> prescriptions;
    private List<VspTreatmentPlanResponse> treatmentPlans;
    private VspShippingDetailsResponse shippingDetails;
    private VspBillingDetailsResponse billingDetails;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static VspOrderResponse from(VspOrder o) {
        return VspOrderResponse.builder()
                .orderId(o.getId())
                .patientId(o.getPatient().getId())
                .patientName(
                        o.getPatient().getFirstName() + " " + o.getPatient().getLastName())
                .gender(o.getPatient().getGender())
                .age(o.getPatient().getAge())
                .customerMappedId(o.getPatient().getCustomerMappedId())
                .createdByUserProfileId(o.getCreatedByUserProfile().getId())
                .assignedToUserProfileId(
                        o.getAssignedToUserProfile() != null
                                ? o.getAssignedToUserProfile().getId()
                                : null)
                .serviceProductId(
                        o.getServiceProduct() != null ? o.getServiceProduct().getId() : null)
                .serviceProductName(
                        o.getServiceProduct() != null ? o.getServiceProduct().getProductName() : null)
                .status(o.getStatus())
                .oralSurgeonName(o.getOralSurgeonName())
                .orthodontistName(o.getOrthodontistName())
                .notesForLab(o.getNotesForLab())
                .caseRecords(o.getCaseRecords().stream()
                        .map(VspCaseRecordResponse::from)
                        .collect(Collectors.toList()))
                .prescriptions(o.getPrescriptions().stream()
                        .map(VspPrescriptionResponse::from)
                        .collect(Collectors.toList()))
                .treatmentPlans(o.getTreatmentPlans().stream()
                        .map(VspTreatmentPlanResponse::from)
                        .collect(Collectors.toList()))
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .shippingDetails(
                        o.getShippingDetails() != null ? VspShippingDetailsResponse.from(o.getShippingDetails()) : null)
                .billingDetails(
                        o.getBillingDetails() != null ? VspBillingDetailsResponse.from(o.getBillingDetails()) : null)
                .build();
    }
}
