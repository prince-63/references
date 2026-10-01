package com.dentalstack.patient.feature.timeline.metadata.event;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerChangeData implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Integer alignerNumber;
    private LocalDate oldEndDate;
    private LocalDate newEndDate;
}
