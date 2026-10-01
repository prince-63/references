package com.dentalstack.patient.feature.location.service;

import com.dentalstack.patient.feature.location.dto.location.GetAllCountriesAndCodes;
import com.dentalstack.patient.feature.location.entity.Country;
import com.dentalstack.patient.feature.location.entity.Location;
import com.dentalstack.patient.feature.location.repository.CountryRepository;
import com.dentalstack.patient.feature.location.repository.LocationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import jakarta.persistence.EntityManager;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    @Override
    public List<Location> getAllData() {
        return locationRepository.findAll();
    }

    @Override
    @Cacheable(value = "uniqueCountries")
    public List<String> getUniqueCountries() {
        List<String> uniqueCountries = locationRepository.findUniqueCountryNames();
        Collections.sort(uniqueCountries);
        return uniqueCountries;
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
    public String importCountriesFromCsv() {
        try (CSVReader reader = new CSVReader(new FileReader(countriesFilePath))) {
            List<String[]> rows = reader.readAll();

            boolean skipHeader = true;

            List<Country> countries = new ArrayList<>();
            for (String[] row : rows) {

                if (skipHeader) {
                    skipHeader = false;
                    continue;
                }

                Country country = new Country();
                country.setId(Long.parseLong(row[0]));
                country.setName(row[1]);
                country.setIso3(row[2]);
                country.setIso2(row[3]);
                country.setNumericCode(row[4]);
                country.setPhoneCode(row[5]);
                country.setCapital(row[6]);
                country.setCurrency(row[7]);
                country.setCurrencyName(row[8]);
                country.setCurrencySymbol(row[9]);
                country.setTld(row[10]);
                country.setNativeName(row[11]);
                country.setRegion(row[12]);

                if (!StringUtils.isEmpty(row[13])) {
                    country.setRegionId(Integer.parseInt(row[13]));
                }

                country.setSubregion(row[14]);

                if (!StringUtils.isEmpty(row[15])) {
                    country.setSubregionId(Integer.parseInt(row[15]));
                }

                country.setNationality(row[16]);

                country.setTimezones(row[17]);

                if (!StringUtils.isEmpty(row[18])) {
                    country.setLatitude(Double.parseDouble(row[18]));
                }

                if (!StringUtils.isEmpty(row[19])) {
                    country.setLongitude(Double.parseDouble(row[19]));
                }

                country.setEmoji(row[20]);
                country.setEmojiU(row[21]);

                countries.add(country);
            }

            countryRepository.saveAll(countries);
        } catch (IOException | CsvException e) {

        }
        return "Countries code added successfully";
    }

    @Override
    public List<GetAllCountriesAndCodes> getCountryCodes() {
        List<Country> countries = countryRepository.findAll();
        return countries.stream().map(GetAllCountriesAndCodes::from).collect(Collectors.toList());
    }

    @Override
    public String getGoogleMapsData(String placeId, String apiKey) {
        String apiUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=" + apiKey;

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(apiUrl, String.class);

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode resultNode = rootNode.path("result");
            JsonNode addressComponentsNode = resultNode.path("address_components");

            String city = null;
            String state = null;
            String country = null;

            for (JsonNode addressComponent : addressComponentsNode) {
                JsonNode typesNode = addressComponent.path("types");
                if (typesNode.isArray()) {
                    for (JsonNode type : typesNode) {
                        String typeValue = type.asText();
                        switch (typeValue) {
                            case "locality" -> city =
                                    addressComponent.path("long_name").asText();
                            case "administrative_area_level_1" -> state =
                                    addressComponent.path("short_name").asText();
                            case "country" -> country =
                                    addressComponent.path("short_name").asText();
                        }
                    }
                }
            }
            List<Location> locations = locationRepository.findAll();
            boolean matchFound = false;
            for (Location location : locations) {
                if (location.getName().equals(city)
                        && location.getStateCode().equals(state)
                        && location.getCountryCode().equals(country)) {
                    matchFound = true;
                    break;
                }
            }
            if (matchFound) {
                return response;
            } else {
                return null;
            }
        } catch (IOException e) {
            return null;
        }
    }

    @Override
    public List<String> getStatesByCountry(String countryName) {
        List<String> distinctStates = locationRepository.findDistinctStatesByCountry(countryName);
        Collections.sort(distinctStates);
        return distinctStates;
    }

    @Override
    @Cacheable(value = "citiesByStateAndCountry", key = "#countryName + '-' + #stateName")
    public List<String> getCitiesByStateAndCountry(String countryName, String stateName) {
        List<String> distinctCities = locationRepository.findDistinctCitiesByStateAndCountry(countryName, stateName);
        Collections.sort(distinctCities);
        return distinctCities;
    }

    @Override
    public void downloadCsv(String githubRawUrl, String localFilePath) throws IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(githubRawUrl);
        try {
            HttpResponse response = httpClient.execute(httpGet);
            if (response.getStatusLine().getStatusCode() == 200) {

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
}
