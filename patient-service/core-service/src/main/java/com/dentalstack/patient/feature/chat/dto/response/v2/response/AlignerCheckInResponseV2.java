package com.dentalstack.patient.feature.chat.dto.response.v2.response;

import com.dentalstack.patient.feature.chat.dto.response.AttachmentResponse;
import com.dentalstack.patient.feature.chat.dto.response.UserProfileInfoResponse;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerCheckInResponseV2 {

    private Long id;
    private Long patientId;
    private Long chatId;
    private Long messageId;
    private Integer alignerNumber;
    private Integer startAlignerNumber;
    private Integer endAlignerNumber;
    private String notes;
    private LocalDateTime checkInDate;
    private Integer progressPercentage;
    private Integer totalAligners;

    private UserProfileInfoResponse submittedBy;
    private List<AttachmentResponse> attachments;
    private List<FileDetails> files;
}
