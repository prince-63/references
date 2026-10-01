package com.dental_stack.files.migration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadedChunkContext {
    private String fileName;
    private String driveFileId;
    private String url;
    private Long size;
    private String thumbnailUrl;
    private String downloadUrl;
}
