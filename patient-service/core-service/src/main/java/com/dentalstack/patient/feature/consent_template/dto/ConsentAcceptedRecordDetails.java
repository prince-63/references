package com.dentalstack.patient.feature.consent_template.dto;

import com.dentalstack.patient.feature.consent_template.entity.ConsentAcceptedRecord;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsentAcceptedRecordDetails {
    private Long acceptedFrom;
    private Long acceptedByPatient;
    private Long acceptedBy;
    private ConsentTemplateDetails consentTemplate;
    private String content;
    private ZonedDateTime acceptedAt;

    public static ConsentAcceptedRecordDetails from(ConsentAcceptedRecord record) {
        return ConsentAcceptedRecordDetails.builder()
                .acceptedFrom(record.getAcceptedFrom().getId())
                .acceptedByPatient(
                        record.getAcceptedByPatient() != null
                                ? record.getAcceptedByPatient().getId()
                                : null)
                .acceptedBy(
                        record.getAcceptedBy() != null ? record.getAcceptedBy().getId() : null)
                .consentTemplate(ConsentTemplateDetails.from(record.getConsentTemplate()))
                .content(record.getContent())
                .acceptedAt(record.getCreatedAt())
                .build();
    }
}
