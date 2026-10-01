package com.dentalstack.patient.feature.caseinfo.service;

import com.dentalstack.patient.feature.caseinfo.dto.CaseInformationRequest;
import com.dentalstack.patient.feature.caseinfo.dto.GetCaseInformationRequest;
import org.springframework.web.multipart.MultipartFile;

public interface CaseInformationService {
    void addCaseInformation(CaseInformationRequest request, MultipartFile[] photos);

    GetCaseInformationRequest getCaseInformation(Long patientId, Long doctorId, String productType);

    GetCaseInformationRequest getCaseInformation(Long patientId);
}
