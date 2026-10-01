package com.dentalstack.patient.feature.treatment.entity.metadata;

import com.dentalstack.patient.feature.treatment.enums.BracesJourneyType;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(value = {@JsonSubTypes.Type(value = BracesJourneyIssueReportedMetadata.class, name = "ISSUE_REPORTED")})
@AllArgsConstructor
@Data
public abstract class BracesJourneyMetadata implements Serializable {

    private final BracesJourneyType type;
}
