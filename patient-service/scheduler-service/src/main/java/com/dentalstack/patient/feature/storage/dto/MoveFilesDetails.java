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
public class MoveFilesDetails {
    private List<FileDetails> movedFiles = new ArrayList<>();
    private List<FileOperationFailureDetails> failedToMove = new ArrayList<>();

    public static MoveFilesDetails from(
            com.dentalstack.patient.feature.storage.service.MoveFilesDetails moveFilesDetails) {
        return new MoveFilesDetails(
                moveFilesDetails.getMovedFiles().stream().map(FileDetails::from).toList(),
                moveFilesDetails.getFailedToMove());
    }
}
