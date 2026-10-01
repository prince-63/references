package com.dentalstack.patient.feature.flag;

import com.dentalstack.patient.feature.flag.dto.FlagRequest;
import com.dentalstack.patient.feature.flag.service.FlagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Flag Controller", description = "Flag Controller API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/flag")
public class FlagController {

    private final FlagService flagService;

    @PutMapping("/toggle")
    @Operation(summary = "Update flag by profile id and flag id", description = "Update flag by profile id and flag id")
    public void toggleFlag(@RequestBody FlagRequest request) {
        flagService.toggleFlag(request);
    }
}
