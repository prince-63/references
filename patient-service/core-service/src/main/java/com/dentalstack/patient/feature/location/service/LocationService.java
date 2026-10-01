package com.dentalstack.patient.feature.location.service;

import com.dentalstack.patient.feature.location.dto.location.GetAllCountriesAndCodes;
import com.dentalstack.patient.feature.location.entity.Location;
import com.opencsv.exceptions.CsvException;
import java.io.IOException;
import java.util.List;

public interface LocationService {

    void saveAll(List<Location> locations);

    List<Location> getAllData();

    List<String> getUniqueCountries();

    List<String> getStatesByCountry(String countryName);

    List<String> getCitiesByStateAndCountry(String countryName, String stateName);

    void downloadCsv(String githubRawUrl, String localFilePath) throws IOException;

    void updateLocationTable() throws IOException, CsvException;

    String importCountriesFromCsv();

    List<GetAllCountriesAndCodes> getCountryCodes();

    String getGoogleMapsData(String placeId, String apiKey);
}
