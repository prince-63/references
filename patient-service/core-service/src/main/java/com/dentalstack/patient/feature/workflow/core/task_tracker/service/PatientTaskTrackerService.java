package com.dentalstack.patient.feature.workflow.core.task_tracker.service;

import com.dentalstack.patient.feature.mcp.PatientTaskTrackerResponseForMcp;
import com.dentalstack.patient.feature.order.dto.CreateManufacturingRequest;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.*;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowCountResponse;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

public interface PatientTaskTrackerService {

    PatientTaskTrackerResponse createPatientTaskTracker(CreatePatientTaskTrackerRequestDto request);

    PatientTaskTrackerResponse updatePatientTaskTracker(UpdatePatientTaskTrackerRequestDto request);

    List<PatientTaskTrackerResponse> getAllPatientTaskTrackers(PatientTaskTrackerRequest request);

    List<WorkflowCountResponse> getWorkflowCountsByProfile(Long profileId);

    PatientTaskTrackerFilterResponseWithPagination getAllPatientTaskTrackersByFilter(
            PatientTaskTrackerFilterRequestDTO request);

    PatientTaskTrackerResponse movePatientTaskTracker(MoveTaskTrackerRequest request);

    @Transactional
    void moveSingleTask(MoveSingleTaskRequest request, Order order);

    @Transactional
    void moveSingleTaskForVsp(MoveSingleTaskRequest request, VspOrder order);

    List<PatientTaskTrackerResponse> moveMultiplePatientTaskTracker(MoveMultiTaskTrackerRequest request);

    PatientTaskTrackerResponse changeWorkflow(SelectCaseForPatientTaskRequest request);

    PatientTaskTrackerResponseWithPagination getOngoingProductionList(@Valid PatientTaskTrackerRequest request);

    List<PatientTaskTrackerResponse> getIndividualPatientTasks(@Valid IndividualPatientTaskRequest request);

    List<PatientTaskTrackerResponseForMcp> getPatientTasksBySearch(IndividualPatientTaskRequest request);

    PatientTaskTracker createNextManufacturingTask(
            UserProfile outsourceLabProfile,
            ManufacturingBatch savedBatch,
            CreateManufacturingRequest request,
            TaskType taskType,
            UserProfile assigneeProfile,
            PatientTaskTracker parentTask,
            ServiceProduct serviceProduct);

    void createCloneOrderTasks(UserProfile userProfile, UserProfile labUserProfile, Order order, Order clonedOrder);

    Page<CancelledTaskTrackerDetailsResponseDTO> getAllCancelledPatientWithFilter(
            CancelledPatientTaskTrackerDetailsWithFilterRequestDTO request);

    void deletePatientTaskTracker(String patientId);

    void createRefinementTask(RefinementRequestDto requestDto);

    void markPatientTaskAsArchive(Long patientId);
}
