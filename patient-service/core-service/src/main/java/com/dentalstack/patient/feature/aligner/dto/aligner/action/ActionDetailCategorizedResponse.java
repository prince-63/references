package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class ActionDetailCategorizedResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Map<AlignerActionType, List<ActionDetail>> categorizedActions;
    private Map<AlignerActionType, Integer> actionCounts;

    public ActionDetailCategorizedResponse() {
        this.categorizedActions = new EnumMap<>(AlignerActionType.class);
        this.actionCounts = new EnumMap<>(AlignerActionType.class);
        for (AlignerActionType actionType : AlignerActionType.values()) {
            this.categorizedActions.put(actionType, new ArrayList<>());
            this.actionCounts.put(actionType, 0);
        }
    }
}
