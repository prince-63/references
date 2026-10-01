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
public class ForceAlignerChangeDetails extends ActionDetailsBase {
    private List<AlignerPhotoDetails> alignerPhotos;
}
