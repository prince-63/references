package com.dentalstack.patient.feature.sampledata.controller;

import com.dentalstack.patient.feature.sampledata.service.SampleDataService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Sample data", description = "APIs to fetch sample data")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/sample/data/v1")
public class SampleDataController {

    private final SampleDataService sampleDataService;
}
