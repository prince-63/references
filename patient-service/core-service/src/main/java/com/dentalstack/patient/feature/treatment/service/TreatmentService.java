package com.dentalstack.patient.feature.treatment.service;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentResponse;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.treatment.dto.*;
import com.dentalstack.patient.feature.treatment.dto.BracesAlignerTreatmentResponse;
import com.dentalstack.patient.feature.treatment.dto.PatientAlignerTreatmentResponse;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface TreatmentService {
    public void addTreatment(AddTreatmentRequest addTreatmentRequest);

    List<GetTreatmentRequest> getTreatmentList(long doctor_id, long patient_id);

    List<BracesAlignerTreatmentResponse> getTreatmentPlanFromOrder(Order order, Long doctorId, Long profileId);

    AlignerTreatmentResponse createOrUpdateTreatmentPlan(
            TreatmentPlanRequest request,
            MultipartFile[] file,
            MultipartFile[] pdfFile,
            MultipartFile[] otherFile,
            MultipartFile leftVideo,
            MultipartFile rightVideo,
            MultipartFile topVideo,
            MultipartFile bottomVideo,
            MultipartFile frontVideo,
            MultipartFile singleVideo);

    AlignerTreatmentResponse getTreatmentPlan(Long alignerTreatmentId);

    List<GetTreatmentPlanResponse> getTreatmentPlan(
            Long patientId, Long doctorId, String orderId, Long organizationId, ProductTypeName treatmentSubtype);

    TreatmentPlanWorkflowResponse getTreatmentPlanForWorkflow(TreatmentPlanForWorkflowRequest request);

    List<BracesAlignerTreatmentResponse> getBracesAndAlignerTreatmentPlanList(
            Long patientId, Long doctorId, String orderId, Long organizationId);

    PatientAlignerTreatmentResponse getPatientAlignerTreatment(Long patientId, Long doctorId);

    AlignerTreatmentResponse approvedPlanByPatient(
            Long treatmentPlanId, Long patientId, Boolean isApprovedByPatient, LocalDate approvedByPatientAt);

    void completeTreatmentPlan(CompleteTreatmentPlanRequest request);

    ShippingDetailsResponse attachShippingToTreatment(@Valid AttachShippingToTreatment request);

    void deleteTreatmentPlan(Long profileId, Long treatmentPlanId);
}
