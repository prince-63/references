package com.dentalstack.patient.feature.storage.service;

import com.dentalstack.patient.feature.storage.entity.File;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadDetails {
    private List<File> uploadFiles = new ArrayList<>();
    private List<FileOperationFailureDetails> failedToUpload = new ArrayList<>();

    public static FileUploadDetails from(List<File> uploadedFiles, List<FileOperationFailureDetails> failedToUpload) {
        return new FileUploadDetails(uploadedFiles, failedToUpload);
    }
}
