package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.flag.dto.FlagDetailsResponse;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTaskTrackerResponseWithPagination {
    private List<PatientTaskTrackerResponse> tasks;
    private List<LabelCountResponse> labelCounts;
    private List<FlagDetailsResponse> flags;
    private PaginationDetails paginationDetails;
}
