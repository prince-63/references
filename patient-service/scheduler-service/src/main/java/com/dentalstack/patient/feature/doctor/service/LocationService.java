package com.dentalstack.patient.feature.doctor.service;

import com.opencsv.exceptions.CsvException;
import java.io.IOException;

public interface LocationService {

    void downloadCsv(String githubRawUrl, String localFilePath) throws IOException;

    void updateLocationTable() throws IOException, CsvException;
}
