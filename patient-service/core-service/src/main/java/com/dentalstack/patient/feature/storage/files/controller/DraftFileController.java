package com.dentalstack.patient.feature.storage.files.controller;

import com.dentalstack.patient.feature.storage.files.service.DraftFileService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.DraftFile;
import com.dentalstack.patient.global.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.file.Paths;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Draft file", description = "Draft APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/draft/file/v1")
@Slf4j
public class DraftFileController {

    private final DraftFileService draftFileService;

    @PostMapping(
            value = "/files",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Upload new files")
    public ResponseEntity<Set<DraftFile>> uploadFiles(
            @RequestParam("patient_id") long patientId,
            @RequestParam("user_id") long userId,
            @RequestParam("type_id") long typeId,
            @RequestParam("user_type") UserType userType,
            @RequestPart(value = "files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new BadRequestException("No draft files attached");
        }

        Set<DraftFile> draftFiles = draftFileService.uploadFiles(
                patientId,
                UserType.PATIENT,
                userId,
                userType,
                Paths.get(String.valueOf(typeId)).toString(),
                files);
        return ResponseEntity.ok(draftFiles);
    }
}
