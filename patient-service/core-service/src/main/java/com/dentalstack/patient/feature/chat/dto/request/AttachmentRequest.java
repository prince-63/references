package com.dentalstack.patient.feature.chat.dto.request;

import com.dentalstack.patient.feature.chat.enums.AttachmentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttachmentRequest {

    @NotNull(message = "Attachment type is required")
    private AttachmentType attachmentType;

    @NotNull(message = "File URL is required")
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
