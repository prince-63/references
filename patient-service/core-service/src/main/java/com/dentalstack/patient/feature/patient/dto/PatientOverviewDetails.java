package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.producttype.dto.producttype.ProductType;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.enums.language.Language;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatientOverviewDetails {
    private PatientDetails patientDetails;
    private GettingStartedDetails gettingStartedDetails;
    private InvitationDetails invitationDetails;
    private boolean isAlignerTreatmentPlanFinalized;
    private Boolean isCustomerTrackingEnabled;
    private Boolean isCustomerStlFileViewEnabled;
    private Boolean isCustomerPrintFileViewEnabled;
    private Boolean isCustomerScanFileViewEnabled;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PatientDetails {
        private Long id;
        private String firstName;
        private String lastName;
        private String profilePictureUrl;
        private Long profileImageId;
        private Integer age;
        private String email;
        private String mobile;
        private String UUID;
        private PatientStatus status;
        private Long doctorId;
        private ZonedDateTime lastLoginAt;
        private CountryCode countryCode;
        private String practiceLocation;
        private String chiefComplaint;
        private List<ProductTypeName> productTypeNames;
        private String gender;
        private String fullName;
        private Language language;
        private String orgName;
        private String country;
        private String city;
        private String state;
        private Long practiceLocationId;
        private ZonedDateTime connectionDate;
        private String customerMappedId;
        private AssignedPractice assignedPractice;
        private Boolean isPracticeAssigned;
        private PatientBelongsTo patientBelongsTo;
        private PatientType patientType;
        private Boolean hasReadExistingPatientForm;
        private LocalDateTime nextFollowUp;
        private String assignee;
        private Long labProfileId;
        private Long labOrgId;
        private List<String> serviceConfigNames;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AssignedPractice {
        private Long practiceDoctorId;
        private Long practiceProfileId;
        private Long practiceOrganizationId;
        private String name;
        private Boolean isCustomerPatient;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GettingStartedDetails {
        private Boolean caseInfoDetailsFilled;
        private Boolean preTreatmentPhotosFilled;
        private Boolean patientDetailsEdited;
        private Boolean markAllAsRead;
        private Boolean treatmentEnable;
        private Boolean finaliseTrackingEnable;
        private PatientDataFillStatus patientDataFillStatus;
        private Boolean askPatientToFill;
        private AlignerTreatmentStatus treatmentStatus;
        private ProductType productType;
        private Long alignerJourneyId;
        private Long treatmentPlanId;
        private LocalDate reminderDate;
        private Status trackingStatus;
        private Boolean isBracesNotesAttached;
        private String treatmentFinalizedOn;
        private Boolean scanFilesFilled;
        private Boolean IsApprovedByPatient;
        private String approvedByPatientAt;
        ZonedDateTime bracesTreatmentPlanCreationDate;
        String orderId;
        private Boolean isClonedOrder;
        private OrderStatus orderStatus;
        private OrderTreatmentPlanStatus initiatorOrderTreatmentPlanStatus;
        private OrderTreatmentPlanStatus approverOrderTreatmentPlanStatus;
        private Boolean isPatientAchieved;
        private int prescriptionCount;
        private Boolean prescriptionRead;
        private Boolean inviteModal;
        private Boolean caseRecord;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class InvitationDetails {
        private Long invitationId;
        private Boolean isPatientConnected;
        private Boolean isPatientInvited;
        private Integer inviteSentDuration;
        private ZonedDateTime lastInviteSentAt;
    }

    public static PatientOverviewDetails from(
            Boolean caseInfoDetailsFilled,
            Boolean preTreatmentPhotosFilled,
            Boolean patientDetailsEdited,
            Boolean markAllAsRead,
            Boolean treatmentEnable,
            Boolean finaliseTrackingEnable,
            PatientDataFillStatus patientDataFillStatus,
            Boolean askPatientToFill,
            AlignerTreatmentStatus treatmentStatus,
            ProductType productType,
            Long alignerJourneyId,
            Status trackingStatus,
            Boolean isBracesNotesAttached,
            String treatmentFinalizedOn,
            Boolean scanFilesFilled,
            Boolean IsApprovedByPatient,
            String approvedByPatientAt,
            Patient patient,
            Long invitationId,
            Boolean isPatientConnected,
            Boolean isPatientInvited,
            ZonedDateTime bracesTreatmentPlanCreationDate,
            boolean isTreatmentFinalized,
            String orderId,
            OrderStatus orderStatus,
            OrderTreatmentPlanStatus initiatorOrderTreatmentPlanStatus,
            OrderTreatmentPlanStatus approverOrderTreatmentPlanStatus,
            Boolean isCustomerMappedPatient,
            int prescriptionCount,
            Long treatmentPlanId,
            Reminder latestReminder,
            PatientTaskTracker patientTaskTracker,
            Duration duration,
            ZonedDateTime resentAt,
            AtomicReference<Boolean> isCustomerTackingEnabled,
            AtomicReference<Boolean> isCustomerStlFileEnabled,
            AtomicReference<Boolean> isCustomerPrintFileEnabled,
            AtomicReference<Boolean> isCustomerScanFileEnabled,
            List<String> enabledItemNames,
            Boolean isClonedOrder) {

        return PatientOverviewDetails.builder()
                .gettingStartedDetails(GettingStartedDetails.builder()
                        .caseInfoDetailsFilled(caseInfoDetailsFilled)
                        .preTreatmentPhotosFilled(preTreatmentPhotosFilled)
                        .patientDetailsEdited(patientDetailsEdited)
                        .markAllAsRead(markAllAsRead)
                        .treatmentEnable(treatmentEnable)
                        .finaliseTrackingEnable(finaliseTrackingEnable)
                        .patientDataFillStatus(patientDataFillStatus)
                        .askPatientToFill(askPatientToFill)
                        .treatmentStatus(treatmentStatus)
                        .productType(productType)
                        .alignerJourneyId(alignerJourneyId)
                        .treatmentPlanId(treatmentPlanId)
                        .reminderDate(latestReminder != null ? latestReminder.getDate() : null)
                        .trackingStatus(trackingStatus)
                        .isBracesNotesAttached(isBracesNotesAttached)
                        .treatmentFinalizedOn(treatmentFinalizedOn)
                        .scanFilesFilled(scanFilesFilled)
                        .IsApprovedByPatient(IsApprovedByPatient)
                        .approvedByPatientAt(approvedByPatientAt)
                        .isClonedOrder(isClonedOrder)
                        .bracesTreatmentPlanCreationDate(bracesTreatmentPlanCreationDate)
                        .orderId(orderId)
                        .orderStatus(orderStatus)
                        .initiatorOrderTreatmentPlanStatus(initiatorOrderTreatmentPlanStatus)
                        .approverOrderTreatmentPlanStatus(approverOrderTreatmentPlanStatus)
                        .isPatientAchieved(patient.getPatientStatus().equals(PatientStatus.ARCHIVE))
                        .prescriptionCount(prescriptionCount)
                        .caseRecord(patient.getCaseRecord())
                        .prescriptionRead(patient.getPrescriptionRead())
                        .inviteModal(patient.getInviteModal())
                        .build())
                .patientDetails(PatientDetails.builder()
                        .id(patient.getId())
                        .labProfileId(patient.getDoctorOrganization()
                                .getAddedByUserProfile()
                                .getId())
                        .labOrgId(patient.getDoctorOrganization()
                                .getAddedByUserProfile()
                                .getOrganization()
                                .getId())
                        .serviceConfigNames(enabledItemNames)
                        .firstName(patient.getFirstName())
                        .lastName(patient.getLastName())
                        .profilePictureUrl(patient.getProfilePictureUrl())
                        .profileImageId(
                                patient.getProfileImage() != null
                                        ? patient.getProfileImage().getId()
                                        : null)
                        .age(patient.getAge())
                        .email(patient.getEmail())
                        .mobile(patient.getMobileNo())
                        .UUID(patient.getUUID())
                        .status(patient.getPatientStatus())
                        .doctorId(patient.getAddedByUserId())
                        .countryCode(patient.getCountryCode())
                        .patientType(patient.getPatientType())
                        .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                        .practiceLocation(patient.getPracticeLocationName())
                        .chiefComplaint(patient.getChiefComplaint())
                        .productTypeNames(patient.getProductTypeNames())
                        .gender(patient.getGender())
                        .language(patient.getLanguage())
                        .orgName(patient.getOrgName())
                        .country(patient.getCountry())
                        .city(patient.getCity())
                        .state(patient.getState())
                        .practiceLocationId(patient.getPracticeLocationId())
                        .connectionDate(patient.getConnectionDate())
                        .customerMappedId(patient.getCustomerMappedId())
                        .patientBelongsTo(patient.getDoctorOrganization().getPatientBelongsTo())
                        .isPracticeAssigned(patient.getDoctorOrganization() != null
                                && patient.getDoctorOrganization().isPracticeAssigned())
                        .assignedPractice(AssignedPractice.builder()
                                .practiceDoctorId(patient.getDoctorOrganization()
                                        .getDoctor()
                                        .getId())
                                .practiceProfileId(patient.getDoctorOrganization()
                                        .getUserProfile()
                                        .getId())
                                .practiceOrganizationId(patient.getDoctorOrganization()
                                        .getOrganization()
                                        .getId())
                                .isCustomerPatient(isCustomerMappedPatient)
                                .name((patient.getDoctorOrganization()
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getSalutation() + ". "
                                                + patient.getDoctorOrganization()
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getFirstName()
                                                + " "
                                                + patient.getDoctorOrganization()
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getLastName())
                                        .trim())
                                .build())
                        .fullName(patient.fullName())
                        .nextFollowUp(patient.getNextFollowUp())
                        .assignee(
                                patientTaskTracker != null
                                                && patientTaskTracker.getAssignee() != null
                                                && patientTaskTracker
                                                                .getAssignee()
                                                                .getUser()
                                                        != null
                                        ? patientTaskTracker
                                                .getAssignee()
                                                .getUser()
                                                .displayName()
                                        : null)
                        .build())
                .invitationDetails(InvitationDetails.builder()
                        .invitationId(invitationId)
                        .isPatientConnected(isPatientConnected)
                        .isPatientInvited(isPatientInvited)
                        .inviteSentDuration(duration != null ? (int) duration.toDays() : null)
                        .lastInviteSentAt(resentAt)
                        .build())
                .isAlignerTreatmentPlanFinalized(isTreatmentFinalized)
                .isCustomerTrackingEnabled(isCustomerTackingEnabled.get())
                .isCustomerStlFileViewEnabled(isCustomerStlFileEnabled.get())
                .isCustomerPrintFileViewEnabled(isCustomerPrintFileEnabled.get())
                .isCustomerScanFileViewEnabled(isCustomerScanFileEnabled.get())
                .build();
    }
}
