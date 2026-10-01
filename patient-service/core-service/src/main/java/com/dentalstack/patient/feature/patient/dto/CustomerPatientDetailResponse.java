package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.projection.CombinedPatientSummary;
import com.dentalstack.patient.feature.user.entity.User;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerPatientDetailResponse {

    private String fullName;
    private Long patientId;
    private String practiceLocationName;

    private LocalDateTime addedOn;
    private String profileUrl;
    private Long profileImageId;
    private Integer age;
    private String gender;
    private String customerMappedId;
    private String createdBy;

    public static CustomerPatientDetailResponse newPatientList(CombinedPatientSummary patient) {
        return CustomerPatientDetailResponse.builder()
                .fullName(patient.getFullName())
                .patientId(patient.getPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .addedOn(patient.getCreatedAt())
                .profileUrl(patient.getProfilePictureUrl())
                .profileImageId(patient.getProfilePictureId())
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomPatientId())
                .createdBy(User.getFullNameWithSalutation(
                        patient.getAddedBySalutation(), patient.getAddedByFirstName(), patient.getAddedByLastName()))
                .build();
    }
}
