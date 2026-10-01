package com.dentalstack.patient.feature.storage.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderFileDetailsDTO {
    private List<FileDetails> images;
    private List<FileDetails> documents;
    private List<FileDetails> scanFiles;
    Long parentOrderId;
}
