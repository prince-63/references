package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.treatment.entity.metadata.BracesJourneyIssueReportedMetadata;
import com.dentalstack.patient.feature.treatment.entity.metadata.BracesJourneyMetadata;
import com.dentalstack.patient.feature.treatment.enums.BracesJourneyIssuesEnum;
import com.dentalstack.patient.feature.treatment.enums.BracesJourneyType;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "patient_braces_journey_issue")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class BracesJourneyIssue extends BaseEntity {

    @NotNull
    @ManyToOne
    @JoinColumn(name = "braces_journey_id")
    private BracesJourney bracesJourney;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private BracesJourneyMetadata metadata;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BracesJourneyType type;

    private boolean isActive;

    public static BracesJourneyIssue bracesJourneyIssue(
            List<BracesJourneyIssuesEnum> issues, String otherIssue, BracesJourney bracesJourney) {
        var metadata = BracesJourneyIssueReportedMetadata.builder()
                .issues(issues)
                .otherIssues(otherIssue)
                .build();

        return BracesJourneyIssue.builder()
                .bracesJourney(bracesJourney)
                .type(BracesJourneyType.ISSUE_REPORTED)
                .metadata(metadata)
                .isActive(true)
                .build();
    }
}
