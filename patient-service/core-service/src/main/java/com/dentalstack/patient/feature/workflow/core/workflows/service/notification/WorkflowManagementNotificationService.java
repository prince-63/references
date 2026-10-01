package com.dentalstack.patient.feature.workflow.core.workflows.service.notification;

import com.dentalstack.patient.feature.patient.dto.AddPatientCommentRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.MoveTaskTrackerRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.SelectCaseForPatientTaskRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import java.util.Set;

public interface WorkflowManagementNotificationService {
    void workflowChangeNotifications(
            SelectCaseForPatientTaskRequest request, PatientTaskTracker existing, UserProfile userProfile);

    void moveTaskNotification(
            MoveTaskTrackerRequest request,
            PatientTaskTracker existing,
            UserProfile userProfile,
            String oldWorkflowStaus,
            String newWorkflowStatus);

    void recordAddedNotification(UserProfile userProfile, Patient patient, String orderId);

    void prescriptionAdded(UserProfile userProfile, Patient patient, String orderId);

    void commentAddedNotification(UserProfile userProfile, Patient patient, AddPatientCommentRequest request);

    void treatmentReadyToBegin(MoveTaskTrackerRequest request, PatientTaskTracker existing, UserProfile userProfile);

    void manufacturingCompleted(PatientTaskTracker existing, UserProfile userProfile);

    void handleGenericNotifications(
            Patient patient,
            UserProfile userProfile,
            WorkflowManagementNotificationServiceImpl.NotificationType notificationType,
            String notes);

    Set<UserProfile> getNotificationRecipients(
            PatientTaskTracker existing, UserProfile userProfile, String workflowName);

    void commentAdded(String email, String mobile, Patient patient, UserProfile userProfile, String notes);
}
