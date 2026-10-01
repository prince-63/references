package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.doctor.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.product.dto.ProductType;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.Language;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.ZonedDateTime;
import java.util.List;
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
        private Boolean hasReadExistingPatientForm;
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
        private Status trackingStatus;
        private Boolean isBracesNotesAttached;
        private String treatmentFinalizedOn;
        private Boolean scanFilesFilled;
        private Boolean IsApprovedByPatient;
        private String approvedByPatientAt;
        ZonedDateTime bracesTreatmentPlanCreationDate;
        String orderId;
        private OrderStatus orderStatus;
        private OrderTreatmentPlanStatus initiatorOrderTreatmentPlanStatus;
        private OrderTreatmentPlanStatus approverOrderTreatmentPlanStatus;
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
            Boolean isCustomerMappedPatient) {

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
                        .trackingStatus(trackingStatus)
                        .isBracesNotesAttached(isBracesNotesAttached)
                        .treatmentFinalizedOn(treatmentFinalizedOn)
                        .scanFilesFilled(scanFilesFilled)
                        .IsApprovedByPatient(IsApprovedByPatient)
                        .approvedByPatientAt(approvedByPatientAt)
                        .bracesTreatmentPlanCreationDate(bracesTreatmentPlanCreationDate)
                        .orderId(orderId)
                        .orderStatus(orderStatus)
                        .initiatorOrderTreatmentPlanStatus(initiatorOrderTreatmentPlanStatus)
                        .approverOrderTreatmentPlanStatus(approverOrderTreatmentPlanStatus)
                        .build())
                .patientDetails(PatientDetails.builder()
                        .id(patient.getId())
                        .firstName(patient.getFirstName())
                        .lastName(patient.getLastName())
                        .profilePictureUrl(patient.getProfilePictureUrl())
                        .age(patient.getAge())
                        .email(patient.getEmail())
                        .mobile(patient.getMobileNo())
                        .UUID(patient.getUUID())
                        .status(patient.getPatientStatus())
                        .doctorId(patient.getAddedByUserId())
                        .countryCode(patient.getCountryCode())
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
                        .build())
                .invitationDetails(InvitationDetails.builder()
                        .invitationId(invitationId)
                        .isPatientConnected(isPatientConnected)
                        .isPatientInvited(isPatientInvited)
                        .build())
                .isAlignerTreatmentPlanFinalized(isTreatmentFinalized)
                .build();
    }
}
