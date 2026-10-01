package com.dentalstack.patient.feature.search.service;

import com.dentalstack.patient.feature.search.controller.v2.GlobalSearchRequest;
import com.dentalstack.patient.feature.search.dto.search.GlobalSearchResult;
import jakarta.validation.Valid;
import java.util.List;

public interface GlobalSearchService {
    List<GlobalSearchResult> search(String query, Long doctorId, Long organizationId, boolean isOrgAdmin);

    List<GlobalSearchResult> searchV2(@Valid GlobalSearchRequest request);
}
