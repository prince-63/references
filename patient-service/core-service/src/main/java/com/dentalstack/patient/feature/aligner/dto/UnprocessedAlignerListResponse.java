package com.dentalstack.patient.feature.aligner.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnprocessedAlignerListResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private List<UnprocessedAlignerResponse> orderDetails;
    private PaginationDetails paginationDetails;
}
