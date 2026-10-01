package com.dentalstack.patient.feature.search.dto.search;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GlobalSearchResponse {
    private List<GlobalSearchResult> results = new ArrayList<>();
}
