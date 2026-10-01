package com.dentalstack.patient.feature.production.controller;

import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Aligner Production v2", description = "Aligner Production v2 APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/production/v2")
public class AlignerProductionControllerV2 {

    private final AlignerProductionService alignerProductionService;
}
