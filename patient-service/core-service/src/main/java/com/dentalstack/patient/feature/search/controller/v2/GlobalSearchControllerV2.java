package com.dentalstack.patient.feature.search.controller.v2;

import com.dentalstack.patient.feature.search.dto.search.GlobalSearchResult;
import com.dentalstack.patient.feature.search.service.GlobalSearchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Global search", description = "Global search APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/global/search/v2")
@Slf4j
public class GlobalSearchControllerV2 {

    private final GlobalSearchService globalSearchService;

    @PostMapping("/search")
    public ResponseEntity<List<GlobalSearchResult>> searchV2(@Valid @RequestBody GlobalSearchRequest request) {
        return ResponseEntity.ok(globalSearchService.searchV2(request));
    }
}
