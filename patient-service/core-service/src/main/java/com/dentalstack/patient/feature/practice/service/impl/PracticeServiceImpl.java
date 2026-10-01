package com.dentalstack.patient.feature.practice.service.impl;

import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.invitation.exception.PatientInvitationNotFoundException;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.practice.dto.AssignPracticeRequest;
import com.dentalstack.patient.feature.practice.service.PracticeService;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PatientAssignedToPracticeEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.mapper.PatientTaskTrackerCreate;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PracticeServiceImpl implements PracticeService {

    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final UserProfileRepository userProfileRepository;
    private final InvitationRepository invitationRepository;
    private final ChatService chatService;
    private final TimelineService timelineService;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final WorkflowRepository workflowRepository;
    private final WorkflowStatusRepository workflowStatusRepository;

    @Lazy
    @Autowired
    private SubscriptionService subscriptionService;

    @Transactional
    @Override
    public void assignPractice(AssignPracticeRequest request) {

        var patientInvitation = patientInvitationDetailsRepository
                .findByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientInvitationNotFoundException(request.getPatientId()));

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getPracticeProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        var orgUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        updatePatientInvitation(patientInvitation, userProfile);

        if (request.getProfileId() != userProfile.getId()) {
            chatService.newPatientAssignedToPractice(EmailSendReq.builder()
                    .practiceAdminName(userProfile.getUser().fullName())
                    .doctorEmail(userProfile.getUser().getEmail())
                    .orgName(orgUserProfile.getOrgName())
                    .patientFirstName(patientDoctorOrganization.getPatient().fullName())
                    .build());

            if (request.getPracticeProfileId() != (request.getProfileId())) {
                var practiceProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(request.getPracticeProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getPracticeProfileId()));
                createPatientTaskTrackerForNewPatient(patientDoctorOrganization.getPatient(), practiceProfile);
            }
            chatService.newPatientAssignedToPracticeNotification(
                    patientDoctorOrganization.getPatient().fullName(),
                    userProfile.getUser().getEmail(),
                    orgUserProfile.getOrgName(),
                    patientDoctorOrganization.getPatient().getId());
            timelineService.addEvent(
                    patientDoctorOrganization.getPatient().getId(),
                    UserType.PATIENT,
                    userProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PATIENT_ASSIGNED_TO_PRACTICE,
                    new PatientAssignedToPracticeEventMetadata(
                            patientDoctorOrganization.getPatient().getId(),
                            orgUserProfile.getOrgName(),
                            userProfile.getPracticeName(),
                            patientDoctorOrganization
                                    .getPatient()
                                    .getPatientType()
                                    .name(),
                            patientDoctorOrganization.getPatient().getHasReadExistingPatientForm()),
                    userProfile,
                    userProfile.getOrganization());
        }

        updatePatientDoctorOrganization(patientDoctorOrganization, userProfile, orgUserProfile);
    }

    public void createPatientTaskTrackerForNewPatient(Patient patient, UserProfile userProfile) {
        try {
            var workflow = workflowRepository
                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined("New Case", "ALIGNER", userProfile.getId())
                    .orElse(null);
            if (workflow != null) {
                var workFlowStatus = workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), "New Patient")
                        .orElseThrow();
                var task = PatientTaskTrackerCreate.createPatientTaskTrackerForNewPatient(
                        patient, userProfile, workflow, workFlowStatus, null);
                if (task != null) {
                    patientTaskTrackerService.createPatientTaskTracker(task);
                }
            }

        } catch (Exception e) {
            log.error("Failed to create patient task tracker for patient ID: {}", patient.getId(), e);
        }
    }

    private void updatePatientDoctorOrganization(
            PatientDoctorOrganization patientDoctorOrganization, UserProfile userProfile, UserProfile orgUserProfile) {

        patientDoctorOrganization.setOrganization(userProfile.getOrganization());
        patientDoctorOrganization.setDoctor(userProfile.getDoctor());
        patientDoctorOrganization.setUserProfile(userProfile);
        patientDoctorOrganization.setAddedByUserProfile(orgUserProfile);
        patientDoctorOrganization.setPracticeAssigned(true);
        patientDoctorOrganization.setPatientBelongsTo(PatientBelongsTo.ASSIGNED_TO_PRACTICE);
        patientDoctorOrganizationRepository.save(patientDoctorOrganization);
    }

    private void updatePatientInvitation(PatientInvitationDetails patientInvitation, UserProfile userProfile) {
        var invitation = patientInvitation.getInvitation();
        invitation.setInviterId(userProfile.getDoctor().getId());
        invitationRepository.save(invitation);
    }
}
