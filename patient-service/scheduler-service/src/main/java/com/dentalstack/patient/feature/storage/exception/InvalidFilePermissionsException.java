package com.dentalstack.patient.feature.storage.exception;

import com.dentalstack.patient.feature.storage.entity.File;
import com.dentalstack.patient.feature.storage.enums.FilePermissionType;
import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.enums.UserType;
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
