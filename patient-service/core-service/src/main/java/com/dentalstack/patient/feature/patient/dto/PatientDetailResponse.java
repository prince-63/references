package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.patient.projection.CombinedPatientSummary;
import com.dentalstack.patient.feature.user.entity.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientDetailResponse {

    private String email;
    private String mobile;
    private String fullName;
    private Long patientId;
    private String practiceLocationName;
    private AppInviteStatus appInviteStatus;
    private String treatmentType;
    private AlignerTreatmentStage treatmentStage;
    private LocalDate treatmentStartDate;
    private LocalDate treatmentEndDate;
    private LocalDateTime addedOn;
    private Long practiceLocationId;
    private String brandName;
    private String profileUrl;
    private Long profileImageId;
    private String countryCode;
    private PatientBelongsTo patientBelongsTo;
    private Long alignerJourneyId;
    private Boolean isYourPatient;
    private Long doctorId;
    private AssignedPractice assignedPractice;
    private PatientType patientType;
    private Boolean hasReadExistingPatientForm;
    private LocalDateTime resentInviteAt;
    private OrderStatus orderStatus;
    private String orderId;
    private Long orderCount;
    private ManufacturingStatus manufacturingStatus;
    private Boolean isTrackingAdded;
    private Integer age;
    private String gender;
    private String customerMappedId;
    private String createdBy;
    private String createdByImage;
    private Boolean isPatientTrackingEnabled;
    private Boolean isPatientStlFileViewEnabled;

    public static PatientDetailResponse newPatientList(
            CombinedPatientSummary patient,
            AlignerTreatmentStage treatmentStage,
            Long oderCount,
            String latestOrderId,
            OrderStatus latestOrderStatus,
            LocalDate treatmentStartDate,
            LocalDate treatmentEndDate) {
        return PatientDetailResponse.builder()
                .email(patient.getEmail())
                .mobile(patient.getMobile())
                .fullName(patient.getFullName())
                .patientId(patient.getPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .addedOn(patient.getCreatedAt())
                .treatmentStage(patient.getTreatmentStage())
                .countryCode(patient.getCountryCode().getCode())
                .profileUrl(patient.getProfilePictureUrl())
                .profileImageId(patient.getProfilePictureId())
                .patientBelongsTo(patient.getPatientBelongsTo())
                .alignerJourneyId(patient.getAlignerJourneyId())
                .doctorId(patient.getDoctorId())
                .treatmentType(patient.getTreatmentType())
                .assignedPractice(AssignedPractice.from(patient))
                .patientType(patient.getPatientType())
                .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                .appInviteStatus(Invitation.convertInvitationStatus(
                        patient.getMappedInvitationStatus(), patient.getIsInvitationSent()))
                .isYourPatient(patient.getIsYouPatient())
                .resentInviteAt(patient.getResentInviteAt())
                .treatmentStage(treatmentStage)
                .orderCount(oderCount)
                .orderStatus(latestOrderStatus)
                .orderId(latestOrderId)
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomPatientId())
                .createdBy(User.getFullNameWithSalutation(
                        patient.getAddedBySalutation(), patient.getAddedByFirstName(), patient.getAddedByLastName()))
                .createdByImage(patient.getAddedByUserProfileUrl())
                .treatmentStartDate(treatmentStartDate)
                .treatmentEndDate(treatmentEndDate)
                .isPatientStlFileViewEnabled(patient.getIsStlFileViewEnabled())
                .isPatientTrackingEnabled(patient.getIsTrackingEnabled())
                .build();
    }

    public static PatientDetailResponse newPatientList(
            CombinedPatientSummary patient,
            AlignerTreatmentStage treatmentStage,
            Long oderCount,
            String latestOrderId,
            OrderStatus latestOrderStatus,
            String brandName,
            ManufacturingStatus manufacturingStatus,
            Boolean isTrackingAdded,
            Long alignerJourneyId,
            LocalDate treatmentStartDate,
            LocalDate treatmentEndDate) {
        return PatientDetailResponse.builder()
                .email(patient.getEmail())
                .mobile(patient.getMobile())
                .fullName(patient.getFullName())
                .patientId(patient.getPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .addedOn(patient.getCreatedAt())
                .treatmentStage(patient.getTreatmentStage())
                .countryCode(patient.getCountryCode().getCode())
                .profileUrl(patient.getProfilePictureUrl())
                .profileImageId(patient.getProfilePictureId())
                .patientBelongsTo(patient.getPatientBelongsTo())
                .alignerJourneyId(patient.getAlignerJourneyId())
                .doctorId(patient.getDoctorId())
                .treatmentType(patient.getTreatmentType())
                .assignedPractice(AssignedPractice.from(patient))
                .patientType(patient.getPatientType())
                .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                .appInviteStatus(Invitation.convertInvitationStatus(
                        patient.getMappedInvitationStatus(), patient.getIsInvitationSent()))
                .isYourPatient(patient.getIsYouPatient())
                .resentInviteAt(patient.getResentInviteAt())
                .treatmentStage(treatmentStage)
                .orderCount(oderCount)
                .orderStatus(latestOrderStatus)
                .orderId(latestOrderId)
                .brandName(brandName)
                .manufacturingStatus(manufacturingStatus)
                .isTrackingAdded(isTrackingAdded)
                .alignerJourneyId(alignerJourneyId)
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomPatientId())
                .createdBy(User.getFullNameWithSalutation(
                        patient.getAddedBySalutation(), patient.getAddedByFirstName(), patient.getAddedByLastName()))
                .createdByImage(patient.getAddedByUserProfileUrl())
                .treatmentStartDate(treatmentStartDate)
                .treatmentEndDate(treatmentEndDate)
                .isPatientStlFileViewEnabled(patient.getIsStlFileViewEnabled())
                .isPatientTrackingEnabled(patient.getIsTrackingEnabled())
                .build();
    }

    public static PatientDetailResponse newPatientList(
            CombinedPatientSummary patient,
            AlignerTreatmentStage treatmentStage,
            String brandName,
            String orderStatus,
            LocalDate treatmentStartDate,
            LocalDate treatmentEndDate) {
        return PatientDetailResponse.builder()
                .email(patient.getEmail())
                .mobile(patient.getMobile())
                .fullName(patient.getFullName())
                .patientId(patient.getPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .addedOn(patient.getCreatedAt())
                .treatmentStage(patient.getTreatmentStage())
                .countryCode(patient.getCountryCode().getCode())
                .profileUrl(patient.getProfilePictureUrl())
                .profileImageId(patient.getProfilePictureId())
                .patientBelongsTo(patient.getPatientBelongsTo())
                .alignerJourneyId(patient.getAlignerJourneyId())
                .doctorId(patient.getDoctorId())
                .treatmentType(patient.getTreatmentType())
                .assignedPractice(AssignedPractice.from(patient))
                .patientType(patient.getPatientType())
                .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                .appInviteStatus(Invitation.convertInvitationStatus(
                        patient.getMappedInvitationStatus(), patient.getIsInvitationSent()))
                .isYourPatient(patient.getIsYouPatient())
                .resentInviteAt(patient.getResentInviteAt())
                .treatmentStage(treatmentStage)
                .brandName(brandName)
                .orderStatus(orderStatus != null ? OrderStatus.valueOf(orderStatus) : null)
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomPatientId())
                .createdBy(User.getFullNameWithSalutation(
                        patient.getAddedBySalutation(), patient.getAddedByFirstName(), patient.getAddedByLastName()))
                .createdByImage(patient.getAddedByUserProfileUrl())
                .treatmentStartDate(treatmentStartDate)
                .treatmentEndDate(treatmentEndDate)
                .isPatientStlFileViewEnabled(patient.getIsStlFileViewEnabled())
                .isPatientTrackingEnabled(patient.getIsTrackingEnabled())
                .build();
    }

    public static PatientDetailResponse newPatientList(
            CombinedPatientSummary patient,
            AlignerTreatmentStage treatmentStage,
            String brandName,
            String orderStatus,
            ManufacturingStatus manufacturingStatus,
            Boolean isTrackingAdded,
            Long alignerJourneyId,
            LocalDate treatmentStartDate,
            LocalDate treatmentEndDate) {
        return PatientDetailResponse.builder()
                .email(patient.getEmail())
                .mobile(patient.getMobile())
                .fullName(patient.getFullName())
                .patientId(patient.getPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .addedOn(patient.getCreatedAt())
                .treatmentStage(patient.getTreatmentStage())
                .countryCode(patient.getCountryCode().getCode())
                .profileUrl(patient.getProfilePictureUrl())
                .profileImageId(patient.getProfilePictureId())
                .patientBelongsTo(patient.getPatientBelongsTo())
                .alignerJourneyId(patient.getAlignerJourneyId())
                .doctorId(patient.getDoctorId())
                .treatmentType(patient.getTreatmentType())
                .assignedPractice(AssignedPractice.from(patient))
                .patientType(patient.getPatientType())
                .hasReadExistingPatientForm(patient.getHasReadExistingPatientForm())
                .appInviteStatus(Invitation.convertInvitationStatus(
                        patient.getMappedInvitationStatus(), patient.getIsInvitationSent()))
                .isYourPatient(patient.getIsYouPatient())
                .resentInviteAt(patient.getResentInviteAt())
                .treatmentStage(treatmentStage)
                .brandName(brandName)
                .orderStatus(orderStatus != null ? OrderStatus.valueOf(orderStatus) : null)
                .manufacturingStatus(manufacturingStatus)
                .isTrackingAdded(isTrackingAdded)
                .alignerJourneyId(alignerJourneyId)
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomPatientId())
                .createdBy(User.getFullNameWithSalutation(
                        patient.getAddedBySalutation(), patient.getAddedByFirstName(), patient.getAddedByLastName()))
                .createdByImage(patient.getAddedByUserProfileUrl())
                .treatmentStartDate(treatmentStartDate)
                .treatmentEndDate(treatmentEndDate)
                .isPatientStlFileViewEnabled(patient.getIsStlFileViewEnabled())
                .isPatientTrackingEnabled(patient.getIsTrackingEnabled())
                .build();
    }
}
