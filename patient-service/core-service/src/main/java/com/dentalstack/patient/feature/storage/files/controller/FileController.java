package com.dentalstack.patient.feature.storage.files.controller;

import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.dto.*;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Files", description = "Files APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/files/v1")
public class FileController {

    private final FilesService filesService;
    private final GoogleDriveService googleDriveService;
    private final PatientProfileService patientProfileService;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/folder")
    @Operation(summary = "Create new folder")
    public void createFolder(@Valid @RequestBody CreateFolderRequest request) throws Exception {
        filesService.createFolder(request);
    }

    @GetMapping("/")
    @Operation(summary = "Get all files present in some path")
    public ResponseEntity<UserFilesDetails> getFiles(
            @RequestParam(value = "path", defaultValue = "/", required = false) String parentPath,
            @RequestParam("requester_user_id") long requesterUserId,
            @RequestParam("requester_user_type") UserType requesterUserType,
            @RequestParam("owner_user_id") long ownerUserId,
            @RequestParam("owner_user_type") UserType ownerUserType) {
        return ResponseEntity.ok(
                filesService.getFiles(requesterUserId, requesterUserType, ownerUserId, ownerUserType, parentPath));
    }

    @PostMapping(
            value = "/files",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload new files")
    public ResponseEntity<FileUploadDetails> uploadFiles(
            @RequestParam("request") String reqStr,
            @RequestPart(value = "files") MultipartFile[] files,
            @RequestParam(value = "profileId", required = false) Long profileId) {
        UploadFilesRequest request = new UploadFilesRequest();
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, UploadFilesRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed parse to upload files request, {}", reqStr, e);
            throw new BadRequestException(
                    String.format("Failed to parse upload files request %s with error %s", reqStr, e));
        }
        boolean isPatientUploading = request.getUploader().getUserType().equals(UserType.PATIENT);
        FileUploadDetails fileUploadDetails =
                FileUploadDetails.from(filesService.uploadFiles(request, files, isPatientUploading));
        googleDriveService.unshareRestrictedFiles(request, fileUploadDetails, profileId);
        return ResponseEntity.ok(fileUploadDetails);
    }

    @PostMapping(
            value = "/chat/files",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload new files")
    public ResponseEntity<FileUploadDetails> uploadFilesFromChat(
            @Parameter(
                            name = "request",
                            example =
                                    """
                    {
                       "parent_path": "/Images",
                       "uploader": {
                         "user_id": 1,
                         "user_type": "DOCTOR"
                       },
                       "owners": [
                         {
                           "user_id": 1,
                           "user_type": "DOCTOR"
                         },
                         {
                           "user_id": 3,
                           "user_type": "PATIENT"
                         }
                       ]
                     }
                    """)
                    @RequestParam("request")
                    String reqStr,
            @RequestPart(value = "files") MultipartFile[] files) {
        UploadFilesRequest request = new UploadFilesRequest();
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, UploadFilesRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed parse to upload files request, {}", reqStr, e);
            throw new BadRequestException(
                    String.format("Failed to parse upload files request %s with error %s", reqStr, e));
        }
        boolean isPatientUploading = request.getUploader().getUserType().equals(UserType.PATIENT);

        return ResponseEntity.ok(
                FileUploadDetails.from(filesService.uploadFilesFromChat(request, files, isPatientUploading)));
    }

    @PostMapping("/get-files")
    public List<FileDetails> getFilesById(@RequestBody GetFilesRequest request) {
        return filesService.getAllFileByIds(request);
    }

    @PostMapping("/get-files-by-names")
    public List<FileDetails> getFilesByNames(@RequestBody GetFilesRequest request) {
        if (request.getImageUrls().isEmpty()) {
            return List.of();
        }
        String[] imageUrls = request.getImageUrls().split(",");
        return filesService.getAllFilesByNames(imageUrls);
    }

    @PostMapping("/rename")
    @Operation(summary = "Rename a file/folder")
    public void renameFile(@Valid @RequestBody RenameFileRequest request) {
        filesService.renameFile(request.getFileId(), request.getNewName());
    }

    @PostMapping("/move")
    @Operation(summary = "Move a file")
    public void moveFile(@Valid @RequestBody MoveFileRequest request) {
        filesService.moveFile(request);
    }

    @PostMapping("/files/move")
    @Operation(summary = "Move files")
    public ResponseEntity<MoveFilesDetails> moveFiles(@Valid @RequestBody MoveFilesRequest request) {
        return ResponseEntity.ok(MoveFilesDetails.from(filesService.moveFiles(request)));
    }

    @PostMapping("/files/delete")
    @Operation(summary = "Delete files")
    public void deleteFiles(@Valid @RequestBody DeleteFilesRequest request) {
        filesService.deleteFiles(request);
    }

    @PostMapping(value = "/download", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @Operation(summary = "Download a file or folder.", description = "All the files within the folder will be zipped")
    public ResponseEntity<Resource> downloadFile(@Valid @RequestBody DownloadFileRequest request) {
        var downloadDetails = filesService.downloadFile(request);
        var file = downloadDetails.file();
        String filename;
        MediaType contentType;
        if (file.isFolder()) {
            filename = file.getName() + ".zip";
            contentType = MediaType.APPLICATION_OCTET_STREAM;
        } else {
            filename = file.getName();
            contentType = from(file.getExtension());
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, String.format("attachment; filename=\"%s\"", filename))
                .body(downloadDetails.content());
    }

    @Nullable
    private static MediaType from(String extension) {
        if (extension == null) {
            return null;
        }

        return switch (extension.toLowerCase()) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "pdf" -> MediaType.APPLICATION_PDF;
            default -> null;
        };
    }

    @PostMapping("/size")
    @Operation(summary = "Get the folder size in MB")
    public ResponseEntity<?> getFolderSizeInMb(@Valid @RequestBody GetFolderSizeRequest request) {
        try {
            double size = filesService.getSizeOfTheFolder(request);
            return ResponseEntity.ok(size);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while getting folder size", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @GetMapping("/doctor/{doctorId}/size")
    public ResponseEntity<Double> getDoctorTotalFileSize(@PathVariable Long doctorId) {
        return ResponseEntity.ok(filesService.calculateDoctorTotalFileSize(doctorId));
    }

    @PostMapping("/toggle-stl-view")
    public void toggleStlFileView(@RequestBody ToggleStlFileViewRequest request) {
        filesService.toggleStlFileView(request.getProfileId());
    }

    @GetMapping("/default-patient-folder/status/{patient_id}")
    public ResponseEntity<Boolean> getDefaultPatientFolderStatus(@PathVariable("patient_id") Long patientId) {
        return ResponseEntity.ok(patientProfileService.getDefaultPatientFolderStatus(patientId));
    }
}
