package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProcessedAndUnprocessedManufacturingResponse {
    private List<ManufacturingResponse> processedManufacturing;
    private UnprocessedAlignerDetails unprocessedManufacturing;
}
