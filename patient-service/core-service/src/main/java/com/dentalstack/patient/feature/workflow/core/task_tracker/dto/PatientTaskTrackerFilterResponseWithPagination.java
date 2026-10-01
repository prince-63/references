package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientTaskTrackerFilterResponseWithPagination {
    private List<PatientTaskTrackerFilterResponse> tasks;
    private List<LabelCountResponse> labelCounts;
    private PaginationDetails paginationDetails;
}
