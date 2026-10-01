package com.dentalstack.patient.feature.chat.dto.response;

import com.dentalstack.patient.feature.chat.enums.AttachmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttachmentResponse {

    private Long id;
    private AttachmentType attachmentType;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private Integer width;
    private Integer height;
    private Integer displayOrder;
}
