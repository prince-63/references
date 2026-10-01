package com.dentalstack.patient.feature.storage.drive.controller;

import com.dentalstack.patient.feature.storage.drive.config.GoogleDriveConfig;
import com.dentalstack.patient.feature.storage.drive.dto.FolderSizeResponse;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.drive.util.ResolveRedirectUrl;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionRepository;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.utils.IDGenerator;
import com.google.api.services.drive.Drive;
import jakarta.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/patient/drive")
@RequiredArgsConstructor
public class GoogleDriveController {

    private final GoogleDriveConfig googleDriveConfig;

    private final GoogleDriveService googleDriveService;

    private final SubscriptionRepository subscriptionRepository;

    private final ResolveRedirectUrl resolveRedirectUrl;

    private final UserProfileRepository userProfileRepository;

    @Value("${google.drive.redirect.uri}")
    private String redirectUri;

    private final FileRepository fileRepository;

    @GetMapping("/authorize/{profileId}")
    public void authorize(@PathVariable Long profileId, HttpServletResponse response) throws Exception {
        String authUrl = googleDriveConfig.getAuthorizationUrl(profileId);
        response.sendRedirect(authUrl);
    }

    @GetMapping("/authorized")
    public void handleGoogleDriveCallback(
            @RequestParam("code") String code, @RequestParam("state") String state, HttpServletResponse response)
            throws Exception {
        Long userId = Long.parseLong(state);
        googleDriveConfig.saveUserCredentials(userId, code);
        subscriptionRepository.updateDriveAuthenticatedStatusById(userId);
        String redirectUrl = redirectUri;
        String frontendUrl = resolveRedirectUrl.resolveUrl(userId, redirectUrl);
        response.sendRedirect(frontendUrl);
    }

    @GetMapping("/image/{fileId}")
    public void streamDriveFile(@PathVariable String fileId, HttpServletResponse response) {
        try {
            File file = fileRepository.findFileByDriveFileId(fileId);
            if (file == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            Long userProfileId = file.getUserProfile().getId();

            Drive drive = googleDriveConfig.ensureValidDriveService(userProfileId);

            response.setContentType("application/octet-stream");
            String originalName = file.getName();
            String safeName = originalName.replaceAll("[^\\x20-\\x7E]", "_");
            String encodedName = java.net.URLEncoder.encode(originalName, java.nio.charset.StandardCharsets.UTF_8)
                    .replace("+", "%20");
            response.setHeader(
                    "Content-Disposition", "inline; filename=\"" + safeName + "\"; filename*=UTF-8''" + encodedName);

            try (OutputStream outputStream = response.getOutputStream()) {
                drive.files().get(fileId).executeMediaAndDownloadTo(outputStream);
                outputStream.flush();
            }
        } catch (Exception e) {
            log.error("Failed to stream drive file {}: {}", fileId, e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/upload")
    public void uploadFile(
            @RequestParam Long profileId, @RequestParam String path, @RequestPart("file") MultipartFile file)
            throws Exception {
        String[] parts = path.split("/");
        String newPath = path.substring(0, path.lastIndexOf('/') + 1) + IDGenerator.generateDriveStyleId() + "_"
                + parts[parts.length - 1];
        googleDriveService.storeFile(profileId, newPath, file);
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(
            @RequestParam Long profileId, @RequestParam String path, @RequestParam String driveFileId)
            throws Exception {
        byte[] fileContent = googleDriveService.downloadFile(profileId, path, driveFileId);

        String filename = extractFilename(path);
        HttpHeaders headers = createDownloadHeaders(filename);

        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }

    private String extractFilename(String path) {
        return path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
    }

    private HttpHeaders createDownloadHeaders(String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        return headers;
    }

    @GetMapping("/download-folder")
    public ResponseEntity<byte[]> downloadFolder(
            @RequestParam Long profileId,
            @RequestParam String path,
            @RequestParam(defaultValue = "folder") String zipName,
            @RequestParam String driveFileId)
            throws Exception {
        byte[] zipContent = googleDriveService.downloadFolder(profileId, path, zipName, driveFileId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", zipName + ".zip");

        return new ResponseEntity<>(zipContent, headers, HttpStatus.OK);
    }

    @PostMapping("/create-folder")
    public void createFolder(@RequestParam Long profileId, @RequestParam String path) throws Exception {
        googleDriveService.createFolder(profileId, path);
    }

    @DeleteMapping("/delete")
    public void deleteFile(@RequestParam Long profileId, @RequestParam String path) throws Exception {
        googleDriveService.deleteFile(profileId, path);
    }

    @PostMapping("/copy")
    public void copyFile(@RequestParam Long profileId, @RequestParam String srcPath, @RequestParam String destPath)
            throws Exception {
        googleDriveService.copyFile(profileId, srcPath, destPath);
    }

    @PostMapping("/move")
    public void moveFile(@RequestParam Long profileId, @RequestParam String srcPath, @RequestParam String destPath)
            throws Exception {
        googleDriveService.moveFile(profileId, srcPath, destPath);
    }

    @PostMapping("/rename-folder")
    public void renameFolder(@RequestParam Long profileId, @RequestParam String path, @RequestParam String newName)
            throws Exception {
        googleDriveService.renameFolder(profileId, path, newName);
    }

    @GetMapping("/folder-size")
    public ResponseEntity<FolderSizeResponse> getFolderSize(@RequestParam Long profileId, @RequestParam String path)
            throws Exception {
        double sizeInMB = googleDriveService.getFolderSizeInMB(profileId, path);

        FolderSizeResponse response = FolderSizeResponse.builder()
                .path(path)
                .sizeInMB(sizeInMB)
                .sizeInGB(sizeInMB / 1024.0)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-file")
    public ResponseEntity<GoogleDriveService.FileContent> getFile(
            @RequestParam Long profileId, @RequestParam String path) throws Exception {
        GoogleDriveService.FileContent fileContent = googleDriveService.getFile(profileId, path);
        return ResponseEntity.ok(fileContent);
    }

    @PostMapping("/share")
    public void shareFile(@RequestBody ShareFile request) throws Exception {
        googleDriveService.shareFile(
                request.profileId, request.path, request.emails, request.role, request.driveFileId);
    }

    @PostMapping("/un-share")
    public void unShare(@RequestBody UnShareFile request) throws Exception {
        googleDriveService.unShareFile(request.profileId, request.path, request.emails, request.driveFileId);
    }

    public record UnShareFile(Long profileId, String path, List<String> emails, String driveFileId) {}

    public record ShareFile(Long profileId, String path, List<String> emails, String role, String driveFileId) {}

    @PostMapping("/share-to-admin")
    public void shareFolderToAdmin(@RequestBody ShareFileToAdmin shareFileToAdmin) throws Exception {
        List<String> emails = userProfileRepository.findByOwnerProfileId(shareFileToAdmin.ownerProfileId);
        googleDriveService.shareFile(shareFileToAdmin.ownerProfileId, "patient", emails, "reader", null);
    }

    public record ShareFileToAdmin(Long ownerProfileId) {}
    ;
}
