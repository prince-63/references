package com.dental_stack.files.move_file.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveFileChunkMessage {
    private String jobId;
    private Long profileId;
    private List<Long> fileIds;
}
