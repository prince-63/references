package com.dentalstack.patient.feature.storage.gallery.dto;

import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerPhotos {
    private List<AlignerPhotoDetails> photos;

    public static AlignerPhotos from(List<AlignerPhoto> alignerPhotos) {
        return new AlignerPhotos(
                alignerPhotos.stream().map(AlignerPhotoDetails::from).toList());
    }
}
