package com.dentalstack.patient.feature.caserecord.service;

import com.dentalstack.patient.feature.caserecord.dto.CaseRecordDetails;
import com.dentalstack.patient.feature.caserecord.dto.CreateCaseRecordRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface CaseRecordService {
    CaseRecordDetails createCaseRecord(
            CreateCaseRecordRequest request,
            MultipartFile[] preTreatmentFiles,
            MultipartFile[] scanFiles,
            MultipartFile[] xRayFiles);

    CaseRecordDetails getCaseRecordByPatientId(Long patientId);

    List<CaseRecordDetails> getAllCaseRecords(Long patientId, String orderId);

    CaseRecordDetails getCaseRecordById(Long caseRecordId);

    void deleteCaseRecord(Long caseRecordId);
}
