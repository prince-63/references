package com.dentalstack.patient.feature.bulkupload.service;

import com.dentalstack.patient.feature.bulkupload.dto.ImportPatientRequest;
import java.io.IOException;
import java.security.GeneralSecurityException;
import org.springframework.transaction.annotation.Transactional;

public interface BulkUploadService {

    void importDataFromSheet(ImportPatientRequest importPatientRequest) throws IOException, GeneralSecurityException;

    @Transactional
    void importTreatmentPlansFromSheet(String spreadsheetId, String range) throws IOException, GeneralSecurityException;
}
