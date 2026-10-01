package com.dentalstack.patient.feature.vsp.service;

import com.dentalstack.patient.feature.patient.dto.PatientGetRequest;
import com.dentalstack.patient.feature.vsp.dto.request.*;
import com.dentalstack.patient.feature.vsp.dto.response.*;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VspService {

    VspOrderResponse createOrder(CreateVspOrderRequest request);

    VspOrderResponse getOrder(String orderId);

    Page<VspOrderResponse> getOrdersByPatient(Long patientId, Pageable pageable);

    VspOrderResponse updateOrder(String orderId, UpdateVspOrderRequest request);

    VspOrderResponse updateOrderStatus(String orderId, VspOrderStatus status);

    VspCaseRecordResponse createAndAttachCaseRecord(String orderId, CreateCaseRecordRequest request);

    VspCaseRecordResponse getCaseRecord(Long caseRecordId);

    VspCaseRecordResponse updateCaseRecord(Long caseRecordId, UpdateCaseRecordRequest request);

    List<VspCaseRecordResponse> getCaseRecordsByPatientId(Long patientId);

    List<VspCaseRecordResponse> getCaseRecordsByOrderId(String orderId);

    VspOrderStatusResponse getOrderStatus(String orderId);

    VspPrescriptionResponse createAndAttachPrescription(CreatePrescriptionRequest request);

    VspPrescriptionResponse getPrescription(Long prescriptionId);

    VspPrescriptionResponse updatePrescription(CreatePrescriptionRequest request);

    List<VspPrescriptionResponse> getPrescriptionsByPatientId(Long patientId);

    List<VspPrescriptionResponse> getPrescriptionsByOrderId(String orderId);

    VspTreatmentPlanResponse createTreatmentPlan(CreateTreatmentPlanRequest request);

    List<VspTreatmentPlanResponse> getTreatmentPlansByOrder(String orderId);

    VspTreatmentPlanResponse updateTreatmentPlan(Long planId, UpdateTreatmentPlanRequest request);

    VspTreatmentPlanResponse submitTreatmentPlanToDoctor(Long planId);

    void deleteTreatmentPlan(Long planId);

    VspPatientDetailsV3 getPatientDetailsV3(@Valid PatientGetRequest request);

    VspMiniDashboardDetailsResponse getMiniDashboardDetails(VspMiniDashboardRequest request);
}
