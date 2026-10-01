package com.dentalstack.patient.feature.timeline.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllUpdates implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<Update> updates;
    private PaginationDetails paginationDetails;

    private long totalActiveEventCount;
    private long totalAlignerEventActiveCount;
}
