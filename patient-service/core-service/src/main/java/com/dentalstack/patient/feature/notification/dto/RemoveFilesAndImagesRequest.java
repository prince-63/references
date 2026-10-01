package com.dentalstack.patient.feature.notification.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RemoveFilesAndImagesRequest {
    private List<Long> fileIds;
    private List<String> imageUrls;
}
