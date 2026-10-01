package com.dentalstack.patient.feature.search.controller;

import com.dentalstack.patient.feature.search.dto.search.GlobalSearchResponse;
import com.dentalstack.patient.feature.search.service.GlobalSearchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Global search", description = "Global search APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/global/search/v1")
@Slf4j
public class GlobalSearchController {

    private final GlobalSearchService globalSearchService;

    @GetMapping("/search")
    public ResponseEntity<GlobalSearchResponse> search(
            @RequestParam("q") String query,
            @RequestParam("doctor_id") Long doctorId,
            @RequestParam("organization_id") Long organizationId,
            @RequestParam("is_org_admin") boolean isOrgAdmin) {
        var results = globalSearchService.search(query, doctorId, organizationId, isOrgAdmin);
        return ResponseEntity.ok(new GlobalSearchResponse(results));
    }
}
