package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.search.projection.GlobalSearchLeadProjection;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class GlobalSearchLeadResponse {
    private Long id;
    private Long patientMappedId;
    private Long patient;
    private Long invitation;
    private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private String countryCode;
    private String practiceLocation;
    private String profileUrl;
    private Long profileImageId;
    private Long version;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static GlobalSearchLeadResponse from(GlobalSearchLeadProjection projection) {
        if (projection == null) {
            return null;
        }

        ZonedDateTime createdAt = projection.getCreatedAt() != null
                ? projection.getCreatedAt().toInstant().atZone(ZoneId.systemDefault())
                : null;

        ZonedDateTime updatedAt = projection.getUpdatedAt() != null
                ? projection.getUpdatedAt().toInstant().atZone(ZoneId.systemDefault())
                : null;

        return GlobalSearchLeadResponse.builder()
                .id(projection.getId())
                .patientMappedId(
                        projection.getPatientMappedId() != null
                                ? projection.getPatientMappedId()
                                : projection.getPatientId())
                .patient(projection.getPatientId())
                .invitation(projection.getInvitationId())
                .firstName(projection.getFirstName())
                .lastName(projection.getLastName())
                .email(projection.getEmail())
                .mobile(projection.getMobile())
                .countryCode(
                        projection.getCountryCode() != null ? String.format("+%s", projection.getCountryCode()) : null)
                .practiceLocation(projection.getPracticeLocation())
                .profileUrl(projection.getProfileUrl())
                .profileImageId(projection.getProfileImageId())
                .version(projection.getVersion())
                .updatedAt(createdAt)
                .createdAt(updatedAt)
                .build();
    }
}
