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
public class AlignerEditEventMetadata extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long alignerJourneyId;
    private Integer alignerNo;
    private LocalDate previousAlignerChangeDate;
    private LocalDate newAlignerChangeDate;
    private String remark;

    @JsonCreator
    public AlignerEditEventMetadata(
            Long alignerJourneyId,
            Integer alignerNo,
            LocalDate previousAlignerChangeDate,
            LocalDate newAlignerChangeDate,
            String remark) {
        super(EventMetadataType.ALIGNER_EDIT);
        this.alignerJourneyId = alignerJourneyId;
        this.alignerNo = alignerNo;
        this.previousAlignerChangeDate = previousAlignerChangeDate;
        this.newAlignerChangeDate = newAlignerChangeDate;
        this.remark = remark;
    }
}
