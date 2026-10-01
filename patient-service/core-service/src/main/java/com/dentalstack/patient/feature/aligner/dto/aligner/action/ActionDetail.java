package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActionDetail implements Serializable {

    private static final long serialVersionUID = 1L;
    private ZonedDateTime performedAt;
    private String patientName;
    private AlignerUpdateCategory category;
    private boolean isActive;
    private Long patientId;
    private AlignerActionType actionType;
    private Long actionId;
    private String patientProfile;
    private Long alignerJourneyId;

    public ActionDetail(AlignerAction alignerAction) {
        this.performedAt = alignerAction.getPerformedAt();
        this.patientName =
                alignerAction.getAligner().getAlignerJourney().getPatient().fullName();
        this.category = alignerAction.getUpdateCategory();
        this.isActive = alignerAction.isActive();
        this.patientId =
                alignerAction.getAligner().getAlignerJourney().getPatient().getId();
        this.actionType = alignerAction.getType();
        this.actionId = alignerAction.getId();
        this.patientProfile =
                alignerAction.getAligner().getAlignerJourney().getPatient().getProfilePictureUrl();
        this.alignerJourneyId = alignerAction.getAligner().getAlignerJourney().getId();
    }
}
