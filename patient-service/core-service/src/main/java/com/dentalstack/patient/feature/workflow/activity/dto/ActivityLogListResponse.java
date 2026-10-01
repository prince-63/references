package com.dentalstack.patient.feature.workflow.activity.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityLogListResponse<T> {
    private List<T> content;
    private PaginationDetails paginationDetails;

    @Builder
    @Data
    public static class PaginationDetails {
        private int pageNumber;
        private int pageSize;
        private long totalActivities;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
