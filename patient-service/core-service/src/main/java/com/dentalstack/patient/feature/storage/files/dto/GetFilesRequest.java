package com.dentalstack.patient.feature.storage.files.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetFilesRequest {
    private List<Long> fileIds;
    private String imageUrls;
}
