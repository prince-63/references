package com.dentalstack.patient.feature.storage.files.domain;

import com.dentalstack.patient.feature.storage.files.entity.File;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MoveFilesDetails {
    private List<File> movedFiles = new ArrayList<>();
    private List<FileOperationFailureDetails> failedToMove = new ArrayList<>();

    public static MoveFilesDetails from(List<File> movedFiles, List<FileOperationFailureDetails> failedToMove) {
        return new MoveFilesDetails(movedFiles, failedToMove);
    }
}
