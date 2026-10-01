package com.dentalstack.patient.feature.storage.drive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PathNode {
    private String path;
    private String fileId;
    private String fileName;
    private String parentFileId;
    private boolean isFolder;
    private Long profileId;
}
