package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.vsp.entity.VspCaseRecord;
import com.dentalstack.patient.feature.vsp.enums.VspCaseRecordMode;
import com.dentalstack.patient.feature.vsp.enums.VspCaseRecordStatus;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspCaseRecordResponse {
    private Long id;
    private String orderId;
    private Long patientId;
    private VspCaseRecordMode recordSelectionMode;
    private VspCaseRecordStatus status;
    private List<FileDetails> extraoralPhotoFiles;
    private List<FileDetails> intraoralPhotoFiles;
    private List<FileDetails> intraoralScanFiles;
    private List<FileDetails> stoneCastFiles;
    private List<FileDetails> dicomFiles;
    private List<FileDetails> radioGrapFiles;
    private List<String> externalLinks;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static VspCaseRecordResponse from(VspCaseRecord r) {
        return VspCaseRecordResponse.builder()
                .id(r.getId())
                .orderId(r.getVspOrder() != null ? r.getVspOrder().getId() : null)
                .recordSelectionMode(r.getRecordSelectionMode())
                .status(r.getStatus())
                .extraoralPhotoFiles(r.getExtraoralPhotoFiles().stream()
                        .map(FileDetails::from)
                        .collect(Collectors.toList()))
                .intraoralPhotoFiles(r.getIntraoralPhotoFiles().stream()
                        .map(FileDetails::from)
                        .collect(Collectors.toList()))
                .intraoralScanFiles(r.getIntraoralScanFiles().stream()
                        .map(FileDetails::from)
                        .collect(Collectors.toList()))
                .stoneCastFiles(
                        r.getStoneCastFiles().stream().map(FileDetails::from).collect(Collectors.toList()))
                .dicomFiles(r.getDicomFiles().stream().map(FileDetails::from).collect(Collectors.toList()))
                .radioGrapFiles(
                        r.getRadioGrapFiles().stream().map(FileDetails::from).collect(Collectors.toList()))
                .externalLinks(
                        r.getExternalLinks() != null ? new java.util.ArrayList<>(r.getExternalLinks()) : List.of())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .patientId(r.getPatient().getId())
                .build();
    }
}
