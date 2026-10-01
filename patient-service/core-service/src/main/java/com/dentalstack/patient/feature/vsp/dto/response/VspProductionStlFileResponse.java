package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.storage.files.entity.File;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspProductionStlFileResponse {
    private Long fileId;
    private String fileName;
    private String url;

    public static VspProductionStlFileResponse from(File file) {
        return VspProductionStlFileResponse.builder()
                .fileId(file.getId())
                .fileName(file.getName())
                .url(file.getUrl())
                .build();
    }
}
