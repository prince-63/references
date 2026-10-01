package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.doctor.dto.AlignerDetailsForDoctor;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDetailsForDoctor {

    private Long id;
    private String firstName;
    private String lastName;

    private String profilePictureUrl;

    private Long practiceLocationId;
    private String practiceLocationName;

    private List<AddressDetails> addresses = new ArrayList<>();

    private Integer age;
    private String email;
    private String mobile;
    private String UUID;
    private PatientStatus status;

    private boolean inFutureTreatment;
    private int currentAligner;
    private boolean isTreatmentFilled;

    private ZonedDateTime lastLoginAt;
    private String brandName;
    private String inviteCode;

    public static PatientDetailsForDoctor from(
            Patient patient,
            String practiceLocationName,
            Long practiceLocationId,
            AlignerDetailsForDoctor alignerDetailsForDoctor,
            String inviteCode) {
        ZonedDateTime lastLoginAt =
                patient.getPatientLogin() != null ? patient.getPatientLogin().getLastLoginAt() : null;
        return new PatientDetailsForDoctor(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getProfilePictureUrl(),
                practiceLocationId,
                practiceLocationName,
                patient.getAddresses().stream().map(AddressDetails::from).toList(),
                patient.getAge(),
                patient.getEmail(),
                patient.getMobileNo(),
                patient.getUUID(),
                patient.getPatientStatus(),
                alignerDetailsForDoctor.isInFutureTreatment(),
                alignerDetailsForDoctor.getCurrentAligner(),
                alignerDetailsForDoctor.isTreatmentFilled(),
                lastLoginAt,
                alignerDetailsForDoctor.getBrandName(),
                inviteCode);
    }
}
