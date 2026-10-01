package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerCheckInUpdate;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProgressPhotoResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<AlignerCheckInUpdate> progressPhotos;
    private long totalCheckInCount;
    private int limit;
    private int retrievedCount;

    public static ProgressPhotoResponse from(List<AlignerCheckInUpdate> progressPhotos, long totalCount, int limit) {
        return ProgressPhotoResponse.builder()
                .progressPhotos(progressPhotos)
                .totalCheckInCount(totalCount)
                .limit(limit)
                .retrievedCount(progressPhotos.size())
                .build();
    }
}
