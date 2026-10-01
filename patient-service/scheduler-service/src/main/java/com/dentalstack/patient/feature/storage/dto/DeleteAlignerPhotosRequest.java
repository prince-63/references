package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.global.enums.UserType;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteAlignerPhotosRequest {
    private Long alignerJourneyId;
    private List<Long> alignerPhotoIds;
    private UserType deleterUserType;
    private Long userId;
}
