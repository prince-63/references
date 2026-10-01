package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.ChangeAlignerRequest;
import com.dentalstack.patient.feature.storage.gallery.exception.PhotoMappingNotFoundException;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddAppointmentPhotoRequest {

    private Long appointmentId;
    private long patientId;
    private boolean withAligner;
    private String description;

    private UserType userType;
    private Long userId;

    private List<ChangeAlignerRequest.PhotoFileMapping> photoFiles;

    public String saveAsFilename(String originalFilename) {
        return photoFiles.stream()
                .filter(mapping -> mapping.getOriginalFilename().equals(originalFilename))
                .findFirst()
                .orElseThrow(() -> new PhotoMappingNotFoundException(originalFilename))
                .getSaveAsFilename();
    }
}
