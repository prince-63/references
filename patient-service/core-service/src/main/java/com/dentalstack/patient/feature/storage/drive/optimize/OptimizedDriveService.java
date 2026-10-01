package com.dentalstack.patient.feature.storage.drive.optimize;

import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.UploadedChunkContext;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface OptimizedDriveService {
    UploadedChunkContext storeFileOptimized(
            Long profileId, String path, MultipartFile file, boolean setPublicPermission) throws Exception;

    List<UploadedChunkContext> uploadMultipleFileOptimized(
            Long profileId, String basePath, MultipartFile[] files, boolean setPublicPermission) throws Exception;
}
