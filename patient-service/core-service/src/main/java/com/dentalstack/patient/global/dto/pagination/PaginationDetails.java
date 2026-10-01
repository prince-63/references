package com.dentalstack.patient.global.dto.pagination;

import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaginationDetails implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private int pageNumber;
    private int pageSize;
    private int totalPatients;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
