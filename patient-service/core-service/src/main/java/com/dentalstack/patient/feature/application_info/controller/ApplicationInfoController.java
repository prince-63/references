package com.dentalstack.patient.feature.application_info.controller;

import com.dentalstack.patient.feature.application_info.entity.ApplicationInfo;
import com.dentalstack.patient.feature.application_info.repository.ApplicationInfoRepository;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/patient")
public class ApplicationInfoController {

    private final ApplicationInfoRepository applicationInfoRepository;

    @GetMapping("/services/info")
    public List<ApplicationInfo> findApplication() {
        return applicationInfoRepository.findAll();
    }
}
