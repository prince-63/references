package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerActionData {
    private Long actionId;
    private AlignerActionType actionType;
    private ZonedDateTime performedAt;
    private ActionDetailsBase details;

    public static AlignerActionData create(AlignerActionType type) {
        AlignerActionData action = new AlignerActionData();
        action.setActionType(type);

        switch (type) {
            case CHECK_IN:
                action.setDetails(new CheckInDetails());
                break;
            case ALIGNER_CHANGE:
                action.setDetails(new AlignerChangeDetails());
                break;
            case FORCE_ALIGNER_CHANGE:
                action.setDetails(new ForceAlignerChangeDetails());
                break;
            case ISSUE_REPORT:
                action.setDetails(new IssueReportDetails());
                break;
            case MANUAl_ALIGNER_CHANGE:
                action.setDetails(new ManualAlignerDetails());
                break;
            case WEAR_DAYS_UPDATED:
                action.setDetails(new WearDaysUpdatedDetails());
                break;
            case TREATMENT_PAUSED:
                action.setDetails(new TreatmentPausedDetails());
                break;
            case TREATMENT_RESUMED:
                action.setDetails(new AwaitingTreatmentResumedDetails());
                break;
            case TREATMENT_DEACTIVATED:
                action.setDetails(new TreatmentDeactivateDetails());
                break;
            case MOVE_TO_PREVIOUS_ALIGNER:
                action.setDetails(new MoveToPreviousAlignerDetails());
                break;
        }

        return action;
    }
}
