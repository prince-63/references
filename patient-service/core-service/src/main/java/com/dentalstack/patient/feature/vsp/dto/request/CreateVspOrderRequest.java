package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateVspOrderRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private Long serviceProductId;

    private String oralSurgeonName;
    private String orthodontistName;
    private String notesForLab;

    private Long caseRecordId;

    @Valid
    private CreateCaseRecordRequest caseRecord;

    private Long prescriptionId;

    @Valid
    private CreatePrescriptionRequest prescription;

    private Long profileId;
    private Long receiverProfileId;
    private Long senderProfileId;
    private VspOrderStatus status;

    @Nullable
    private CreateVspShippingDetailsRequest shippingDetails;

    @Nullable
    private CreateVspBillingDetailsRequest billingDetails;
}
