package com.dentalstack.patient.feature.storage.dto;

import com.dentalstack.patient.feature.storage.entity.File;
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
