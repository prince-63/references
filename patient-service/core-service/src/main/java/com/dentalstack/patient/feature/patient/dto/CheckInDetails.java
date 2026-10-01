package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CheckInDetails extends ActionDetailsBase {
    private AlignerUpdateCategory category;
    private List<AlignerPhotoDetails> alignerPhotos;
    private ZonedDateTime checkInDate;
}
