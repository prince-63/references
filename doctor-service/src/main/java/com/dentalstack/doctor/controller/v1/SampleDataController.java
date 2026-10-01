package com.dentalstack.doctor.controller.v1;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.sampledata.GenerateSampleDoctorRequest;
import com.dentalstack.doctor.service.ChatService;
import com.dentalstack.doctor.service.SampleDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Sample data", description = "APIs to fetch sample data")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/doctor/sample/data/v1")
public class SampleDataController {

    private final SampleDataService sampleDataService;
    private final ChatService chatService;

    @PostMapping
    @Operation(
            summary = "Get IDs of major entities of the sample data.",
            description = "You can call other APIs with these Ids.")
    public ResponseEntity<DoctorDetails> getSampleDataIds(@RequestBody GenerateSampleDoctorRequest request) {
        return ResponseEntity.ok(sampleDataService.getSampleDoctor(request));
    }

    @GetMapping
    public void getSampleDataIds() {}
}
