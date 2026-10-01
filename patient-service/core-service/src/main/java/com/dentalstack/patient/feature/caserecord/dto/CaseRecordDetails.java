package com.dentalstack.patient.feature.caserecord.dto;

import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CaseRecordDetails {
    private Long caseRecordId;
    private String caseRecordName;
    private String chiefComplaint;
    private List<FileDetails> preTreatmentFiles;
    private List<FileDetails> scanFiles;
    private List<FileDetails> xRayFiles;
    private Boolean isAddedByCustomer;
    private Boolean isAddedByAdmin;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private Boolean isMappedWithOrder;

    public static CaseRecordDetails from(CaseRecord caseRecord, Boolean isAddedByCustomer, Boolean isAddedByAdmin) {
        return CaseRecordDetails.builder()
                .caseRecordId(caseRecord.getId())
                .caseRecordName(caseRecord.getCaseRecordName())
                .chiefComplaint(caseRecord.getChiefComplaint())
                .preTreatmentFiles(caseRecord.getPreTreatmentFiles().stream()
                        .filter(file -> file.getStatus() == Status.ACTIVE)
                        .map(FileDetails::from)
                        .toList())
                .scanFiles(caseRecord.getScanFiles().stream()
                        .filter(file -> file.getStatus() == Status.ACTIVE)
                        .map(FileDetails::from)
                        .toList())
                .xRayFiles(caseRecord.getXRaysFiles().stream()
                        .filter(file -> file.getStatus() == Status.ACTIVE)
                        .map(FileDetails::from)
                        .toList())
                .createdAt(caseRecord.getCreatedAt() != null ? caseRecord.getCreatedAt() : null)
                .updatedAt(caseRecord.getUpdatedAt() != null ? caseRecord.getUpdatedAt() : null)
                .isAddedByCustomer(isAddedByCustomer)
                .isAddedByAdmin(isAddedByAdmin)
                .isMappedWithOrder(caseRecord.getOrderId() != null)
                .build();
    }

    public static CaseRecordDetails from(CaseRecord caseRecord, Boolean isAddedByCustomer) {
        return from(caseRecord, isAddedByCustomer, false);
    }

    public static CaseRecordDetails from(CaseRecord caseRecord) {
        return CaseRecordDetails.builder()
                .caseRecordId(caseRecord.getId())
                .caseRecordName(caseRecord.getCaseRecordName())
                .chiefComplaint(caseRecord.getChiefComplaint())
                .preTreatmentFiles(caseRecord.getPreTreatmentFiles().stream()
                        .filter(file -> file.getStatus() == Status.ACTIVE)
                        .map(FileDetails::from)
                        .toList())
                .scanFiles(caseRecord.getScanFiles().stream()
                        .filter(file -> file.getStatus() == Status.ACTIVE)
                        .map(FileDetails::from)
                        .toList())
                .xRayFiles(caseRecord.getXRaysFiles().stream()
                        .filter(file -> file.getStatus() == Status.ACTIVE)
                        .map(FileDetails::from)
                        .toList())
                .createdAt(caseRecord.getCreatedAt() != null ? caseRecord.getCreatedAt() : null)
                .updatedAt(caseRecord.getUpdatedAt() != null ? caseRecord.getUpdatedAt() : null)
                .isMappedWithOrder(caseRecord.getOrderId() != null)
                .build();
    }
}
