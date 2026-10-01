package com.dentalstack.patient.feature.braces.controller;

import com.dentalstack.patient.feature.braces.service.BracesJourneyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Braces", description = "Braces APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/braces/dashboard/v1")
@Slf4j
public class BracesDashboardController {

    private final BracesJourneyService bracesService;
}
