package com.dentalstack.patient.feature.storage.exception;

import com.dentalstack.patient.feature.storage.entity.File;
import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class FailedToDownloadFileException extends BusinessException {
    public FailedToDownloadFileException(File file) {
        super(
                BusinessErrorCode.FAILED_DOWNLOAD_FILE,
                String.format("Failed to download file with id %s", file.getId()));
    }
}
