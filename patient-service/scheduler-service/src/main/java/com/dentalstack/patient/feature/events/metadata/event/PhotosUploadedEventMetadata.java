package com.dentalstack.patient.feature.events.metadata.event;

import com.dentalstack.patient.feature.storage.dto.AddAlignerPhotoRequest;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class PhotosUploadedEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private AddAlignerPhotoRequest uploadPhotosDetails;
    private AlignerJourneyDetails alignerJourneyDetails;

    @JsonCreator
    public PhotosUploadedEventMetadata(
            AddAlignerPhotoRequest uploadPhotosDetails, AlignerJourneyDetails alignerJourneyDetails) {
        super(EventMetadataType.PHOTOS_UPLOADED);
        this.uploadPhotosDetails = uploadPhotosDetails;
        this.alignerJourneyDetails = alignerJourneyDetails;
    }
}
