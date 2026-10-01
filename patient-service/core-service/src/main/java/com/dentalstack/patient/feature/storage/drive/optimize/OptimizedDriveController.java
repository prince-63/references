package com.dentalstack.patient.feature.storage.drive.optimize;

import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.dentalstack.patient.global.utils.IDGenerator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/patient/drive/opt")
@RequiredArgsConstructor
public class OptimizedDriveController {
    private final OptimizedDriveService googleDriveService;

    @PostMapping("/upload")
    public void uploadFile(
            @RequestParam Long profileId, @RequestParam String path, @RequestPart("file") MultipartFile file)
            throws Exception {
        String[] parts = path.split("/");
        String newPath = path.substring(0, path.lastIndexOf('/') + 1) + IDGenerator.generateDriveStyleId() + "_"
                + parts[parts.length - 1];
        googleDriveService.storeFileOptimized(profileId, newPath, file, true);
    }

    @PostMapping("/multiple-upload")
    public List<UploadedChunkContext> batchUploadFiles(
            @RequestParam(name = "profileId") Long profileId,
            @RequestParam(name = "basePath") String basePath,
            @RequestParam(defaultValue = "true") boolean setPublicPermission,
            @RequestPart("files") MultipartFile[] files)
            throws Exception {
        return googleDriveService.uploadMultipleFileOptimized(profileId, basePath, files, setPublicPermission);
    }
}
