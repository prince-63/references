package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.Permission;
import com.google.api.services.drive.model.PermissionList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UnShareFileOperation extends AbstractDriveOperation<OperationContext.UnShareContext, Void> {

    public UnShareFileOperation(OptimizedDrivePathResolver pathResolver) {
        super(pathResolver);
    }

    @Override
    public void validate(OperationContext.UnShareContext context) {
        super.validate(context);

        if (context.getProfileId() == null) {
            throw new IllegalArgumentException("ProfileId cannot be null");
        }

        if ((context.getPath() == null || context.getPath().isBlank()) && context.getDriveFileId() == null) {
            throw new IllegalArgumentException("Either path or driveFileId must be provided");
        }

        if (context.getEmails() == null || context.getEmails().isEmpty()) {
            throw new IllegalArgumentException("Emails list cannot be null or empty");
        }
    }

    @Override
    protected Void doExecute(Drive drive, OperationContext.UnShareContext context) throws Exception {
        String fileId = resolveFileOrFolderId(drive, context);
        if (fileId == null) {
            throw new IllegalArgumentException("File or folder not found: " + context.getPath());
        }
        for (String email : context.getEmails()) {
            revokeUserAccess(drive, fileId, email);
        }
        return null;
    }

    private String resolveFileOrFolderId(Drive drive, OperationContext.UnShareContext context) throws Exception {
        if (context.getDriveFileId() != null) {
            return context.getDriveFileId();
        }

        String fileId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), false, false);
        if (fileId == null) {
            fileId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, false);
        }
        return fileId;
    }

    private void revokeUserAccess(Drive drive, String fileId, String email) throws Exception {
        PermissionList permissionList = drive.permissions()
                .list(fileId)
                .setFields("permissions(id,emailAddress,role)")
                .execute();
        if (permissionList.getPermissions() == null) {
            return;
        }
        for (Permission permission : permissionList.getPermissions()) {
            if ("owner".equals(permission.getRole())) {
                continue;
            }
            if (email.equalsIgnoreCase(permission.getEmailAddress())) {
                drive.permissions().delete(fileId, permission.getId()).execute();
                return;
            }
        }
    }

    @Override
    protected void logError(OperationContext.UnShareContext context, Exception error) {
        log.error("Failed to un-share path {} for users {}", context.getPath(), context.getEmails(), error);
    }
}
