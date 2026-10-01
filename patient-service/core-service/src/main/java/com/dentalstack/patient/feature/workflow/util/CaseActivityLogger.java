package com.dentalstack.patient.feature.workflow.util;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.activity.dto.InternalActivityRequest;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import com.dentalstack.patient.feature.workflow.activity.enums.VisibilityScope;
import com.dentalstack.patient.feature.workflow.activity.repository.ActivityRepository;
import com.dentalstack.patient.feature.workflow.activity.service.ActivityLogService;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CaseActivityLogger {

    private final ActivityLogService activityLogService;
    private final ActivityRepository activityLogRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;

    private UserProfile resolveLabProfile(Long patientId) {
        Long labProfileId = patientDoctorOrganizationRepository.findLabProfileId(patientId);
        if (labProfileId == null) return null;
        return userProfileRepository.findById(labProfileId).orElse(null);
    }

    private boolean isPlanningEnabled(Long profileId) {
        List<String> configNames = serviceConfigurationRepository.findEnabledItemNames(profileId);
        return configNames.stream().anyMatch(a -> a.equals("PLANNING"));
    }

    private boolean canLog(UserProfile userProfile) {
        return !isPlanningEnabled(userProfile.getId());
    }

    private Set<UserProfile> getVisibleProfiles(Long patientId) {
        UserProfile practice = patientDoctorOrganizationRepository.findPracticeProfile(patientId);
        UserProfile lab = resolveLabProfile(patientId);
        if (practice.equals(lab)) {
            return Set.of(lab);
        }
        return Set.of(practice, lab);
    }

    private void log(
            Patient patient, UserProfile activityBy, ActivityType type, String message, Set<UserProfile> visibleTo) {
        InternalActivityRequest request = InternalActivityRequest.builder()
                .patient(patient)
                .activityBy(activityBy)
                .activityType(type)
                .activity(message)
                .isCustomActivity(false)
                .visibilityScope(VisibilityScope.SPECIFIC)
                .visibleToProfiles(visibleTo)
                .build();
        activityLogService.internalActivityLog(request);
    }

    public void logCaseSavedAsDraftIfAbsent(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        if (activityLogRepository.existsByPatient_IdAndActivityType(patient.getId(), ActivityType.CASE_CREATION))
            return;
        log(patient, activityBy, ActivityType.CASE_CREATION, "Patient saved as draft.", visible);
    }

    public void logFilesUploaded(Patient patient, UserProfile activityBy, int count) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = count + " file" + (count == 1 ? "" : "s") + " uploaded to the case.";
        log(patient, activityBy, ActivityType.RECORD_UPLOAD, msg, visible);
    }

    public void logCaseSubmitted(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        log(patient, activityBy, ActivityType.SUBMISSION, "Case submitted for planning.", visible);
    }

    public void logInfoRequested(Patient patient, UserProfile activityBy, String comment) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String message = "Lab requested for more information. NOTE Lab Note: " + comment;
        log(patient, activityBy, ActivityType.INFORMATION_REQUEST, message, visible);
    }

    public void logInitialPlanSentForReview(Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("\"%s – %s\" sent for review by the lab.", planName, version);
        log(patient, activityBy, ActivityType.INITIAL_PLAN, msg, visible);
    }

    public void logRevisionRequested(
            Patient patient, UserProfile activityBy, String planName, String version, String note) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg =
                String.format("You requested a revision for \"%s – %s\". NOTE Your Note: %s", planName, version, note);
        log(patient, activityBy, ActivityType.REVISION_FEEDBACK, msg, visible);
    }

    public void logIterativePlanSentForReview(
            Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("\"%s – %s\" has been sent for your review by the lab.", planName, version);
        log(patient, activityBy, ActivityType.ITERATIVE_PLAN, msg, visible);
    }

    public void logStlRequested(Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("Request for STL sent for \"%s – %s\".", planName, version);
        log(patient, activityBy, ActivityType.STL_REQUESTED, msg, visible);
    }

    public void logStlUploaded(Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("Lab has uploaded the STL files for \"%s – %s\".", planName, version);
        log(patient, activityBy, ActivityType.STL_UPLOADED, msg, visible);
    }

    public void logPlanApproved(Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("\"%s – %s\" approved by you.", planName, version);
        log(patient, activityBy, ActivityType.APPROVAL, msg, visible);
    }

    public void logPrimaryClosure(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        log(
                patient,
                activityBy,
                ActivityType.PRIMARY_CLOSURE,
                "Primary planning completed and finalized by the lab.",
                visible);
    }

    public void logRefinementSubmitted(Patient patient, UserProfile activityBy, Long refinementNumber) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("Refinement case #%d submitted for planning.", refinementNumber);
        log(patient, activityBy, ActivityType.REFINEMENT_START, msg, visible);
    }
}
