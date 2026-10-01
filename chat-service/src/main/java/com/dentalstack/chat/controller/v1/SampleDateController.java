package com.dentalstack.chat.controller.v1;

import com.dentalstack.chat.dto.sampledata.GenerateSampleChatRequest;
import com.dentalstack.chat.service.SampleDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Sample data", description = "APIs to fetch sample data")
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/chat/sample/data/v1/")
public class SampleDateController {
    private final SampleDataService sampleDataService;

    @PostMapping
    @Operation(summary = "Add sample chat")
    public void getSampleDataIds(@RequestBody GenerateSampleChatRequest request) {
        sampleDataService.generateSampleChats(request);
    }
}
