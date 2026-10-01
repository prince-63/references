package com.dentalstack.patient.feature.location.controller;

import com.dentalstack.patient.feature.location.dto.location.GetAllCountriesAndCodes;
import com.dentalstack.patient.feature.location.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Slf4j
@Tag(name = "Location", description = "Location controller")
@RequestMapping("/patient/location/v1")
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    @Operation(summary = "Get all location")
    public ResponseEntity<?> getAllLocation() {
        return ResponseEntity.ok(locationService.getAllData());
    }

    @GetMapping("/countries")
    @Operation(summary = "Get all countries")
    public ResponseEntity<List<String>> getCountries() {
        return ResponseEntity.ok(locationService.getUniqueCountries());
    }

    @GetMapping("/states/{countryName}")
    @Operation(summary = "Get states by country")
    public ResponseEntity<?> getStatesByCountry(@PathVariable String countryName) {
        return ResponseEntity.ok(locationService.getStatesByCountry(countryName));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get cities by state")
    public ResponseEntity<?> getCitiesByState(
            @RequestParam(name = "countryName") String countryName,
            @RequestParam(name = "stateName") String stateName) {
        log.info("Fetching cities for state {} in country {}", stateName, countryName);

        List<String> cities = locationService.getCitiesByStateAndCountry(countryName, stateName);
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/download/csv")
    public void downloadCsv(@RequestParam String githubRawUrl, @RequestParam String localFilePath) throws IOException {
        locationService.downloadCsv(githubRawUrl, localFilePath);
    }

    @GetMapping("/get/country-codes")
    @Operation(summary = "Get the all countries and it's codes")
    public List<GetAllCountriesAndCodes> getCountryCodes() {
        return locationService.getCountryCodes();
    }
}
