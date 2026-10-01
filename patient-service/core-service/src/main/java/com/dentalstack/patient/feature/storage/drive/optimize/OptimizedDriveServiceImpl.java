package com.dentalstack.patient.feature.storage.drive.optimize;

import com.dentalstack.patient.feature.storage.drive.config.GoogleDriveConfig;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import com.google.api.services.drive.Drive;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class OptimizedDriveServiceImpl implements OptimizedDriveService {

    private final GoogleDriveConfig googleDriveConfig;
    private final OptimizedUploadFileOperation optimizedUploadFileOperation;

    @Override
    public UploadedChunkContext storeFileOptimized(
            Long profileId, String path, MultipartFile file, boolean setPublicPermission) throws Exception {
        Drive drive = getDriveService(profileId);

        OperationContext.UploadContext context = OperationContext.UploadContext.builder()
                .profileId(profileId)
                .path(path)
                .file(file)
                .build();

        return optimizedUploadFileOperation.executeUpload(drive, context, false);
    }

    @Override
    public List<UploadedChunkContext> uploadMultipleFileOptimized(
            Long profileId, String basePath, MultipartFile[] files, boolean setPublicPermission) throws Exception {
        Drive drive = getDriveService(profileId);
        return optimizedUploadFileOperation.batchUpload(drive, profileId, basePath, files, setPublicPermission);
    }

    private Drive getDriveService(Long profileId) throws Exception {
        return googleDriveConfig.ensureValidDriveService(profileId);
    }
}
