package com.dentalstack.doctor.exception.file;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class FileSizeExceededException extends BusinessException {
    public FileSizeExceededException(long fileSize) {
        super(BusinessErrorCode.FILE_LIMIT_EXCEEDED, "File limit exceeded. The file size is " + fileSize + " bytes.");
    }
}
