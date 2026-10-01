package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.order.enums.OrderDeliveryPreference;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateOrderRequest {
    private Long doctorId;
    private Long profileId;
    private Long organizationId;
    private Long prescriptionId;
    private String orderId;
    private Long patientId;
    private InvitePatientRequest patientDetails;
    private CreateOrderDetails orderDetails;
    private PrescriptionDetails prescriptionDetails;
    private OrderStatus status;
    private Long caseRecordId;

    @Nullable
    private TaskType caseType;

    private int currentStep;
    private JsonNode serviceProducts;
    private Long serviceProductId;

    @Nullable
    private ShippingDetailsRequest shippingDetails;

    @Nullable
    private OrderDeliveryPreference deliveryPreference;

    private Long practiceDoctorId;
    private Long practiceProfileId;
    private Long practiceOrganizationId;
    private Boolean mapToPrescription;
    private Boolean mapToCaseRecord;
}
