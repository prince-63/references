package com.dentalstack.patient.feature.timeline.metadata.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class EditWearTimeEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long alignerJourneyId;
    private Integer alignerNo;
    private LocalDate previousDaysToWearEachAligner;
    private LocalDate newDaysToWearEachAligner;

    @JsonCreator
    public EditWearTimeEventMetadata(
            Long alignerJourneyId,
            Integer alignerNo,
            LocalDate previousDaysToWearEachAligner,
            LocalDate newDaysToWearEachAligner) {
        super(EventMetadataType.WEAR_DAY_EDIT);
        this.alignerJourneyId = alignerJourneyId;
        this.alignerNo = alignerNo;
        this.previousDaysToWearEachAligner = previousDaysToWearEachAligner;
        this.newDaysToWearEachAligner = newDaysToWearEachAligner;
    }
}
