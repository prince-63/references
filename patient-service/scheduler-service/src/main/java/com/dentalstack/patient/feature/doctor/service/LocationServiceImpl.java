package com.dentalstack.patient.feature.doctor.service;

import com.dentalstack.patient.feature.doctor.repository.CountryRepository;
import com.dentalstack.patient.feature.doctor.repository.LocationRepository;
import com.dentalstack.patient.feature.user.entity.Location;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import jakarta.persistence.EntityManager;
import java.io.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationServiceImpl implements LocationService {

    @Value("${githubRawUrl}")
    private String githubRawUrl;

    @Value("${countryCodeUrl}")
    private String countryCodeUrl;

    @Value("${localFilePath}")
    private String localFilePath;

    @Value("${countriesLocalFilePath}")
    private String countriesFilePath;

    private final LocationRepository locationRepository;

    private final CountryRepository countryRepository;

    private EntityManager entityManager;

    public void saveAll(List<Location> locations) {
        locationRepository.saveAll(locations);
    }

    public void updateLocationTable() throws IOException, CsvException {
        List<Location> locationsFromCsv = readCsvAndMapToLocations();
        List<Location> existingLocations = locationRepository.findAll();

        Set<String> targetCountries = new HashSet<>(Arrays.asList(
                "Egypt",
                "Kenya",
                "Mauritius",
                "Morocco",
                "Namibia",
                "Nigeria",
                "South Africa",
                "Tanzania",
                "Zimbabwe",
                "Argentina",
                "Brazil",
                "Canada",
                "Mexico",
                "United States",
                "Azerbaijan",
                "Bahrain",
                "Bangladesh",
                "China",
                "Hong Kong S.A.R.",
                "India",
                "Indonesia",
                "Israel",
                "Japan",
                "Kuwait",
                "Macau S.A.R.",
                "Malaysia",
                "Maldives",
                "Nepal",
                "Oman",
                "Philippines",
                "Qatar",
                "Saudi Arabia",
                "Singapore",
                "South Korea",
                "Sri Lanka",
                "Taiwan",
                "Thailand",
                "Turkey",
                "United Arab Emirates",
                "Vietnam",
                "Belgium",
                "Finland",
                "France",
                "Germany",
                "Greece",
                "Ireland",
                "Italy",
                "Netherlands",
                "Norway",
                "Poland",
                "Portugal",
                "Russia",
                "Spain",
                "Sweden",
                "Switzerland",
                "Ukraine",
                "United Kingdom",
                "Australia",
                "New Zealand"));

        for (Location location : locationsFromCsv) {
            if (targetCountries.contains(location.getCountryName())) {
                Optional<Location> existingLocationOptional = existingLocations.stream()
                        .filter(l -> l.getCityId().equals(location.getCityId()))
                        .findFirst();

                if (existingLocationOptional.isPresent()) {
                    Location existingLocation = existingLocationOptional.get();
                    existingLocation.updateFields(location);
                    locationRepository.save(existingLocation);
                } else {
                    locationRepository.save(location);
                }
            }
        }
    }

    private List<Location> readCsvAndMapToLocations() throws IOException, CsvException {
        List<Location> locations = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new FileReader(localFilePath))) {
            List<String[]> rows = reader.readAll();

            for (String[] row : rows) {
                Location location = getLocation(row);
                locations.add(location);
            }
        }
        return locations;
    }

    private static Location getLocation(String[] row) {
        Location location = new Location();

        location.setCityId(row[0]);
        location.setName(row[1]);
        location.setStateId(row[2]);
        location.setStateCode(row[3]);
        location.setStateName(row[4]);
        location.setCountryId(row[5]);
        location.setCountryCode(row[6]);
        location.setCountryName(row[7]);
        location.setLatitude(row[8]);
        location.setLongitude(row[9]);
        location.setWikiDataId(row[10]);
        return location;
    }

    @Override
    public void downloadCsv(String githubRawUrl, String localFilePath) throws IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(githubRawUrl);
        try {
            HttpResponse response = httpClient.execute(httpGet);
            if (response.getStatusLine().getStatusCode() == 200) {
                // Save the content to a local file
                try (InputStream inputStream = response.getEntity().getContent();
                        OutputStream outputStream = new FileOutputStream(localFilePath)) {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                }
            } else {
                log.error(
                        "Failed to download CSV file. HTTP status code: {}",
                        response.getStatusLine().getStatusCode());
            }
        } catch (Exception ignored) {

        }
    }

    @Scheduled(cron = "0 0 10 1 * ?") // Run at 10:00 AM on the first day of every month
    public void downloadCsvOfLocation() {
        log.info("Downloading csv file for locations");
        try {
            downloadCsv(githubRawUrl, localFilePath);
        } catch (IOException e) {
            log.error("Error occurred while downloading CSV file: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 0 1 * ?") // Run at 12:00 AM on the first day of every month
    public void updateLocationTableFromCsv() {
        try {
            // Read and update Location table
            updateLocationTable();
        } catch (IOException | CsvException ignored) {
        }
    }
}
