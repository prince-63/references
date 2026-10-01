package com.dentalstack.patient.feature.aligner.dto.aligner.v2;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.Nullable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurrentAlignerDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Nullable
    private Integer number;

    private LocalDate startDate;
    private LocalDate endDate;
}
