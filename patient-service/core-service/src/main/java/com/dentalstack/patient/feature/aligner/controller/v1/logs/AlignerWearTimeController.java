package com.dentalstack.patient.feature.aligner.controller.v1.logs;

import com.dentalstack.patient.feature.aligner.service.logs.AlignerWearTimeLogsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Aligner", description = "Aligner APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/wear/time/logs/v1")
public class AlignerWearTimeController {

    private final AlignerWearTimeLogsService sessionService;
}
