package com.dentalstack.patient.feature.vsp.util;

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
public class VspCaseActivityLogger {

    private final ActivityLogService activityLogService;
    private final ActivityRepository activityRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;

    private UserProfile resolveLabProfile(Long patientId) {
        Long labProfileId = patientDoctorOrganizationRepository.findLabProfileId(patientId);
        if (labProfileId == null) return null;
        return userProfileRepository.findById(labProfileId).orElse(null);
    }

    private boolean isVspEnabled(Long profileId) {
        List<String> configNames = serviceConfigurationRepository.findEnabledItemNames(profileId);
        return configNames.stream().anyMatch(a -> a.equals("VSP PLANNING"));
    }

    private boolean canLog(UserProfile userProfile) {
        return !isVspEnabled(userProfile.getId());
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
        log(patient, activityBy, ActivityType.VSP_CASE_CREATED, "Patient saved as draft.", visible);
    }

    public void logCaseSubmitted(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        log(patient, activityBy, ActivityType.VSP_CASE_SUBMITTED, "Case submitted for planning.", visible);
    }

    public void logFilesUploaded(Patient patient, UserProfile activityBy, int count) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = count + " file" + (count == 1 ? "" : "s") + " uploaded to the case.";
        log(patient, activityBy, ActivityType.VSP_FILES_UPLOADED, msg, visible);
    }

    public void logPlanReady(Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format("“%s – %s” sent for review by the lab.", planName, version);
        log(patient, activityBy, ActivityType.VSP_PLAN_READY_FOR_REVIEW, msg, visible);
    }

    public void logPlanApproved(Patient patient, UserProfile activityBy, String planName, String version) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;

        String msg = String.format("“%s – %s” has been approved.", planName, version);

        log(patient, activityBy, ActivityType.VSP_PLAN_APPROVED, msg, visible);
    }

    public void logRevisionRequested(
            Patient patient, UserProfile activityBy, String planName, String version, String note) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = String.format(
                "Customer requested a revision for “%s – %s”. NOTE Your Note: %s", planName, version, note);
        log(patient, activityBy, ActivityType.VSP_REVISION_REQUESTED, msg, visible);
    }

    public void logMoreInfoRequired(Patient patient, UserProfile activityBy, String comment) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        String msg = "Lab requested for more information. NOTE Lab Note: " + comment;
        log(patient, activityBy, ActivityType.VSP_MORE_INFORMATION_REQUIRED, msg, visible);
    }

    public void logPlanningCompleted(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        log(
                patient,
                activityBy,
                ActivityType.VSP_PLANNING_COMPLETED,
                "Planning completed and finalized by the lab.",
                visible);
    }

    public void logProductionOrderCreated(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;
        log(
                patient,
                activityBy,
                ActivityType.VSP_PRODUCTION_ORDER_CREATED,
                "Production order has been created.",
                visible);
    }

    public void logOrderShipped(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;

        log(patient, activityBy, ActivityType.VSP_ORDER_SHIPPED, "Order has been shipped", visible);
    }

    public void logOrderDelivered(Patient patient, UserProfile activityBy) {
        Set<UserProfile> visible = getVisibleProfiles(patient.getId());
        if (canLog(visible.iterator().next())) return;

        log(patient, activityBy, ActivityType.VSP_ORDER_DELIVERED, "Items have been delivered to Customer", visible);
    }
}
