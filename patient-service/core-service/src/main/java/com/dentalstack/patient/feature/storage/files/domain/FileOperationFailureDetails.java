package com.dentalstack.patient.feature.storage.files.domain;

import com.dentalstack.patient.feature.storage.files.entity.File;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileOperationFailureDetails {
    private String fileName;
    private String error;

    public static FileOperationFailureDetails from(MultipartFile file, Exception e) {
        return new FileOperationFailureDetails(file.getOriginalFilename(), e.getMessage());
    }

    public static FileOperationFailureDetails from(File file, Exception e) {
        return new FileOperationFailureDetails(file.getFullPath(), e.getMessage());
    }
}
