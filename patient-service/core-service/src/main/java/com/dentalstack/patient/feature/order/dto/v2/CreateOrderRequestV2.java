package com.dentalstack.patient.feature.order.dto.v2;

import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsRequest;
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
public class CreateOrderRequestV2 {

    private InvitePatientRequestV2 patientDetails;
    private CreateOrderDetailsV2 orderDetails;
    private PrescriptionDetails prescriptionDetails;
    private OrderStatus status;
    private Long caseRecordId;

    @Nullable
    private TaskType caseType;

    private int currentStep;
    private JsonNode serviceProducts;

    @Nullable
    private ShippingDetailsRequest shippingDetails;

    @Nullable
    private OrderDeliveryPreference deliveryPreference;

    private String orderType;

    private Long prescriptionId;
    private Long serviceProductId;

    private String orderId;
    private Long patientId;
    private Long doctorId;
    private Long profileId;
    private Long organizationId;

    private Long receiverDoctorId;
    private Long receiverOrganizationId;
    private Long receiverProfileId;

    private Long senderProfileId;
    private Long senderDoctorId;
    private Long senderOrganizationId;
    private Boolean caseSubmitted;
    private Boolean mapToPrescription;
    private Boolean mapToCaseRecord;
}
