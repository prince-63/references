package com.dentalstack.patient.feature.vsp.dto.request;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;
import com.dentalstack.patient.global.enums.language.Language;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.List;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VspPatientDetailsV3 implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private String gender;
    private String fullName;
    private String profileUrl;
    private Long profileImageId;
    private Integer age;
    private String email;
    private String mobile;
    private String UUID;
    private PatientStatus status;
    private PatientType patientType;
    private ZonedDateTime addedOn;

    private String practiceLocationName;
    private Long practiceLocationId;

    private Language language;
    private String orgName;
    private String country;
    private String city;
    private String state;
    private String customerMappedId;
    private String countryCode;
    private Boolean isInvitationSent;
    private InvitationStatus invitationStatus;
    private ZonedDateTime resentInviteAt;
    private String orderId;
    private String productionId;
    private List<String> archivedOrderIds;
    private String createdBy;
    private List<Long> chatIds;
    private VspOrderStatus orderStatus;
    private VspProductionStatus productionStatus;

    public static VspPatientDetailsV3 newPatientList(
            Patient patient,
            @Nullable Invitation invitation,
            String orderId,
            VspOrderStatus orderStatus,
            List<String> archivedOrderId,
            List<Long> chatIds,
            VspProductionStatus productionStatus,
            String productionId) {
        return VspPatientDetailsV3.builder()
                .patientId(patient.getId())
                .gender(patient.getGender())
                .fullName(patient.fullName())
                .profileUrl(patient.getProfilePictureUrl())
                .profileImageId(
                        patient.getProfileImage() != null
                                ? patient.getProfileImage().getId()
                                : null)
                .age(patient.getAge())
                .email(patient.getEmail())
                .mobile(patient.getMobileNo())
                .UUID(patient.getUUID())
                .status(patient.getPatientStatus())
                .patientType(patient.getPatientType())
                .addedOn(patient.getCreatedAt())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .language(patient.getLanguage())
                .orgName(patient.getOrgName())
                .country(patient.getCountry())
                .city(patient.getCity())
                .state(patient.getState())
                .customerMappedId(patient.getCustomerMappedId())
                .countryCode(patient.getCountryCode().getCode())
                .isInvitationSent(invitation != null ? invitation.getIsInvitationSent() : null)
                .invitationStatus(invitation != null ? invitation.getStatus() : null)
                .resentInviteAt(invitation != null ? invitation.getResentInviteAt() : null)
                .orderId(orderId)
                .orderStatus(orderStatus)
                .archivedOrderIds(archivedOrderId)
                .createdBy(patient.getDoctorOrganization()
                        .getUserProfile()
                        .getUser()
                        .fullNameWithSalutation())
                .chatIds(chatIds)
                .productionStatus(productionStatus)
                .productionId(productionId)
                .build();
    }
}
