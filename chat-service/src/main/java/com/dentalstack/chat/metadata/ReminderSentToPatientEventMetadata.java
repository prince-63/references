package com.dentalstack.chat.metadata;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class ReminderSentToPatientEventMetadata extends EventMetadata {
    private Long doctorId;
    private Integer alignerSrNo;

    @JsonCreator
    public ReminderSentToPatientEventMetadata(Long doctorId, Integer alignerSrNo) {
        super(EventMetadataType.REMINDER_SENT_TO_PATIENT);
        this.doctorId = doctorId;
        this.alignerSrNo = alignerSrNo;
    }

    public static EventMetadata from(Long doctorId, Integer alignerSrNo) {
        return ReminderSentToPatientEventMetadata.builder()
                .doctorId(doctorId)
                .alignerSrNo(alignerSrNo)
                .build();
    }
}
