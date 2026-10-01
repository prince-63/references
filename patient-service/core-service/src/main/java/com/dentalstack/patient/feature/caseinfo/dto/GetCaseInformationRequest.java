package com.dentalstack.patient.feature.caseinfo.dto;

import com.dentalstack.patient.feature.caseinfo.Metadata;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GetCaseInformationRequest {
    private Metadata metadata;
    private LocalDateTime timestamp;
    private List<FileDetails> files;
}
