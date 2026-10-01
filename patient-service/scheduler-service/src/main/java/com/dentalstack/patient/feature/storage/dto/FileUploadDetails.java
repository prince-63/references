package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.feature.storage.service.FileOperationFailureDetails;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadDetails {
    private List<FileDetails> uploadFiles = new ArrayList<>();
    private List<FileOperationFailureDetails> failedToUpload = new ArrayList<>();

    public static FileUploadDetails from(
            com.dentalstack.patient.feature.storage.service.FileUploadDetails fileUploadDetails) {
        return new FileUploadDetails(
                fileUploadDetails.getUploadFiles().stream()
                        .map(FileDetails::from)
                        .toList(),
                fileUploadDetails.getFailedToUpload());
    }
}
