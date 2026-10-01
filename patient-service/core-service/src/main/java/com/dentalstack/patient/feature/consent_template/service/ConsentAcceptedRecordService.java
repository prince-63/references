package com.dentalstack.patient.feature.consent_template.service;

import com.dentalstack.patient.feature.consent_template.dto.ConsentAcceptRequest;
import com.dentalstack.patient.feature.consent_template.dto.GetConsentAcceptedRecordsRequest;
import com.dentalstack.patient.feature.consent_template.dto.GetConsentAcceptedRecordsResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ConsentAcceptedRecordService {
    void customerConsentAccept(ConsentAcceptRequest request, MultipartFile file);

    void patientConsentAccept(ConsentAcceptRequest request, MultipartFile file);

    GetConsentAcceptedRecordsResponse getConsentsAcceptedForPatient(GetConsentAcceptedRecordsRequest request);

    GetConsentAcceptedRecordsResponse getConsentsAcceptedForCustomer(GetConsentAcceptedRecordsRequest request);
}
