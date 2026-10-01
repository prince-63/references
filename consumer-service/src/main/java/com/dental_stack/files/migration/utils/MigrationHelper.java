package com.dental_stack.files.migration.utils;

import com.dental_stack.files.migration.projections.LoadPatientMetadata;
import com.dental_stack.files.migration.repository.PatientRepository;
import java.util.regex.Pattern;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class MigrationHelper {

    private final PatientRepository patientRepository;
    private static final Pattern PATIENT_ID_PATTERN = Pattern.compile("patient/(\\d+)_");

    public String getNewPath(String originalPath) {
        String[] parts = originalPath.split("/");
        if (parts.length > 1) {
            String patientIdentifier = parts[1];

            if (patientIdentifier.contains("_")) {
                return originalPath;
            }

            try {
                Long patientId = Long.parseLong(patientIdentifier);
                LoadPatientMetadata details = patientRepository.loadPatientMetadata(patientId);
                if (details != null) {
                    StringBuilder rootPath =
                            new StringBuilder(
                                    "patient/"
                                            + details.getId()
                                            + "_"
                                            + tagFullName(
                                                    details.getFirstName(), details.getLastName()));
                    for (int i = 2; i < parts.length; i++) {
                        rootPath.append("/").append(parts[i]);
                    }
                    return rootPath.toString();
                }
            } catch (NumberFormatException e) {
                return originalPath;
            }
        }
        return originalPath;
    }

    public String getNewPath(Long patientId) {
        LoadPatientMetadata details = patientRepository.loadPatientMetadata(patientId);
        StringBuilder path =
                new StringBuilder(
                        "patient/"
                                + details.getId()
                                + "_"
                                + tagFullName(details.getFirstName(), details.getLastName()));
        path.append("/");
        return path.toString();
    }

    public String tagFullName(String firstName, String lastName) {
        String f = firstName != null ? firstName.replace(" ", "").trim() : "";
        String l = lastName != null ? lastName.replace(" ", "").trim() : "";

        if (!f.isEmpty() && !l.isEmpty()) {
            return f + "_" + l;
        } else if (!f.isEmpty()) {
            return f;
        } else if (!l.isEmpty()) {
            return l;
        }
        return "";
    }

    public String getMimeTypeFromFile(String extension) {
        if (extension == null || extension.isEmpty()) {
            return "application/octet-stream";
        }

        return switch (extension.toLowerCase()) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "svg" -> "image/svg+xml";
            case "webp" -> "image/webp";
            case "apng" -> "image/apng";
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt" -> "text/plain";
            case "csv" -> "text/csv";
            case "zip" -> "application/zip";
            case "rar" -> "application/x-rar-compressed";
            case "7z" -> "application/x-7z-compressed";
            case "mp4" -> "video/mp4";
            case "avi" -> "video/x-msvideo";
            case "mov" -> "video/quicktime";
            case "wmv" -> "video/x-ms-wmv";
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "dcm", "dicom" -> "application/dicom";
            case "stl" -> "model/stl";
            default -> "application/octet-stream";
        };
    }
}
