package com.dentalstack.patient.feature.storage.files.dto;

import com.dentalstack.patient.feature.storage.files.entity.File;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserFilesDetails {
    private List<FileDetails> files;

    public static UserFilesDetails from(List<File> files) {
        return new UserFilesDetails(files.stream().map(FileDetails::from).toList());
    }
}
