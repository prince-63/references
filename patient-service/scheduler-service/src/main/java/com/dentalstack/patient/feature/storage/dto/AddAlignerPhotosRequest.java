package com.dentalstack.patient.feature.storage.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddAlignerPhotosRequest {
    private List<AddAlignerPhotoRequest> photos;
}
