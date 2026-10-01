package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimelineDetailsWithPagination implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private TimelineDetails timelineDetails;
    private PaginationDetails paginationDetails;
}
