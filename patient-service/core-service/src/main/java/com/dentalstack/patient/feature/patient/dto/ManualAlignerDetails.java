package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ManualAlignerDetails extends ActionDetailsBase {
    private List<AlignerPhotoDetails> previousAlignerPhotos;

    private List<AlignerPhotoDetails> newAlignerPhotos;
}
