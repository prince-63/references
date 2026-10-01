package com.dentalstack.patient.feature.manufacturing;

import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlignerInfo implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Integer count;

    private Integer upperRangeStart;

    private Integer lowerRangeStart;
    private Integer upperRangeEnd;
    private Integer lowerRangeEnd;
    private Integer stages;

    public static AlignerInfo from(ManufacturingBatch manufacturingBatch) {
        return AlignerInfo.builder()
                .count(manufacturingBatch.getTotalAligners())
                .upperRangeStart(manufacturingBatch.getUpperAlignerStart())
                .upperRangeEnd(manufacturingBatch.getUpperAlignerEnd())
                .lowerRangeStart(manufacturingBatch.getLowerAlignerStart())
                .lowerRangeEnd(manufacturingBatch.getLowerAlignerEnd())
                .build();
    }
}
