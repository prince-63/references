package com.dentalstack.patient.feature.storage.files.exception;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.FilePermissionType;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;
import java.util.List;

public class InvalidFilePermissionsException extends BusinessException {
    public InvalidFilePermissionsException(
            File file, long requesterUserId, UserType requesterUserType, List<FilePermissionType> requiredPerms) {
        super(
                BusinessErrorCode.FILE_OPERATION_NOT_ALLOWED,
                String.format(
                        "%s with id %s do have permission of the operation on file %s, required permissions: %s",
                        requesterUserType, requesterUserId, file.getFullPath(), requiredPerms));
    }
}
