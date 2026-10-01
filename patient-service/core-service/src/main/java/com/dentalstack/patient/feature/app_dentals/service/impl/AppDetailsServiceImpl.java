package com.dentalstack.patient.feature.app_dentals.service.impl;

import com.dentalstack.patient.feature.app_dentals.dto.AppDetailsRequest;
import com.dentalstack.patient.feature.app_dentals.dto.AppDetailsResponse;
import com.dentalstack.patient.feature.app_dentals.entity.AppDetails;
import com.dentalstack.patient.feature.app_dentals.exception.AppNameAlreadyExistsException;
import com.dentalstack.patient.feature.app_dentals.repository.AppDetailsRepository;
import com.dentalstack.patient.feature.app_dentals.service.AppDetailsService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppDetailsServiceImpl implements AppDetailsService {
    private final AppDetailsRepository appDetailsRepository;

    @Override
    public List<AppDetailsResponse> getAllAppDetails() {
        List<AppDetails> appDetailsList = appDetailsRepository.findAll();

        if (appDetailsList.isEmpty()) {
            appDetailsList = appDetailsRepository.saveAll(List.of(
                    new AppDetails("PatientApp", "1.0.1", "1.0.0"), new AppDetails("DoctorApp", "1.0.0", "1.0.2")));
        }

        return appDetailsList.stream()
                .map(appDetails -> AppDetailsResponse.builder()
                        .appName(appDetails.getAppName())
                        .iosAppVersion(appDetails.getIosAppVersion())
                        .androidAppVersion(appDetails.getAndroidAppVersion())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public AppDetailsResponse updateAppDetailsByAppName(AppDetailsRequest newAppDetails) {
        AppDetails appDetails = appDetailsRepository
                .findByAppName(newAppDetails.getOldAppName())
                .orElseThrow(() ->
                        new RuntimeException("AppDetails not found for app name: " + newAppDetails.getOldAppName()));

        appDetails.setAppName(newAppDetails.getNewAppName());
        appDetails.setIosAppVersion(newAppDetails.getIosAppVersion());
        appDetails.setAndroidAppVersion(newAppDetails.getAndroidAppVersion());
        appDetailsRepository.save(appDetails);

        return AppDetailsResponse.builder()
                .appName(appDetails.getAppName())
                .iosAppVersion(appDetails.getIosAppVersion())
                .androidAppVersion(appDetails.getAndroidAppVersion())
                .build();
    }

    @Override
    public AppDetailsResponse createNewAppDetails(AppDetailsRequest request) {
        if (appDetailsRepository.findByAppName(request.getNewAppName()).isPresent()) {
            throw new AppNameAlreadyExistsException(request.getNewAppName());
        }

        AppDetails appDetails = new AppDetails();
        appDetails.setAppName(request.getNewAppName());
        appDetails.setIosAppVersion(request.getIosAppVersion());
        appDetails.setAndroidAppVersion(request.getAndroidAppVersion());

        appDetails = appDetailsRepository.save(appDetails);

        return AppDetailsResponse.builder()
                .appName(appDetails.getAppName())
                .iosAppVersion(appDetails.getIosAppVersion())
                .androidAppVersion(appDetails.getAndroidAppVersion())
                .build();
    }
}
