package com.dentalstack.patient.feature.storage.gallery.dto;

import com.dentalstack.patient.feature.user.enums.UserType;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AddPreAlignerPhotoRequest {
    private Long alignerJourneyId;
    private String description;

    private UserType userType;
    private Long userId;
}
