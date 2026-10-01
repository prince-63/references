package com.dentalstack.patient.feature.patient.dto;

import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActionDetailsBase {
    private boolean isApproved;
    private Long alignerJourneyId;
    private ZonedDateTime approvedOn;
}
