package com.dental_stack.files.migration.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileMigrationChunkMessage {
    private String jobId;
    private Long profileId;
    private List<Long> fileIds;
}
