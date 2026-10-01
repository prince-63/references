package com.dentalstack.patient.feature.storage.files.service;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.DraftFile;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

public interface DraftFileService {

    String DRAFT_FOLDER_NAME = "draft";

    Set<DraftFile> uploadFiles(
            long ownerUserId,
            @NotNull UserType ownerUserType,
            long uploaderUserId,
            @NotNull UserType uploaderUserType,
            String parentPath,
            @NotNull MultipartFile[] files);

    String rootPath(long userId, @NotNull UserType userType);

    @Transactional
    File moveDraftToFiles(DraftFile draftFile, String newParentFile, Long patientId);

    Set<File> moveDraftToFiles(Set<DraftFile> draftFiles, String newFilesParentPath, Long patientId);
}
