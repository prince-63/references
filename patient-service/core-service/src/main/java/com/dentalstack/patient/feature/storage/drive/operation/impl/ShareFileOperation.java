package com.dentalstack.patient.feature.storage.drive.operation.impl;

import com.dentalstack.patient.feature.storage.drive.operation.AbstractDriveOperation;
import com.dentalstack.patient.feature.storage.drive.operation.OperationContext.ShareContext;
import com.dentalstack.patient.feature.storage.drive.optimize.OptimizedDrivePathResolver;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.Permission;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ShareFileOperation extends AbstractDriveOperation<ShareContext, Void> {

    public ShareFileOperation(OptimizedDrivePathResolver pathResolver) {
        super(pathResolver);
    }

    @Override
    public void validate(ShareContext context) {
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
        if (context.getRole() == null || context.getRole().trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }
        String role = context.getRole().toLowerCase();
        if (!role.equals("reader") && !role.equals("writer") && !role.equals("commenter") && !role.equals("owner")) {
            throw new IllegalArgumentException("Invalid role. Must be one of: reader, writer, commenter, owner");
        }
    }

    @Override
    protected Void doExecute(Drive drive, ShareContext context) throws Exception {
        String fileId = resolveFileOrFolderId(drive, context);

        if (fileId == null) {
            throw new IllegalArgumentException("File or folder not found: " + context.getPath());
        }

        for (String email : context.getEmails()) {
            shareWithUser(drive, fileId, email, context.getRole());
        }

        return null;
    }

    private String resolveFileOrFolderId(Drive drive, ShareContext context) throws Exception {
        if (context.getDriveFileId() != null) {
            return context.getDriveFileId();
        } else {

            String fileId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), false, false);
            if (fileId == null) {
                fileId = pathResolver.resolvePath(drive, context.getProfileId(), context.getPath(), true, false);
            }
            return fileId;
        }
    }

    private void shareWithUser(Drive drive, String fileId, String email, String role) throws Exception {
        Permission permission =
                new Permission().setType("user").setRole(role.toLowerCase()).setEmailAddress(email);

        drive.permissions()
                .create(fileId, permission)
                .setSendNotificationEmail(true)
                .execute();

        log.info("Shared file/folder {} with user {} with role {}", fileId, email, role);
    }

    @Override
    protected void logError(ShareContext context, Exception error) {
        log.error("Failed to share path {} with users: {}", context.getPath(), error.getMessage());
    }
}
