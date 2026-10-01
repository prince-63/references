package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.patient.enums.PendingActionEnum;
import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class PendingPatientActionCategorizedResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Map<PendingActionEnum, List<PendingPatientActionResponse>> categorizedPatients;
    private Map<PendingActionEnum, Integer> actionCounts;

    public PendingPatientActionCategorizedResponse() {
        this.categorizedPatients = new EnumMap<>(PendingActionEnum.class);
        this.actionCounts = new EnumMap<>(PendingActionEnum.class);
        for (PendingActionEnum action : PendingActionEnum.values()) {
            this.categorizedPatients.put(action, new ArrayList<>());
            this.actionCounts.put(action, 0);
        }
    }

    public void updateActionCounts() {
        for (PendingActionEnum action : categorizedPatients.keySet()) {
            this.actionCounts.put(action, categorizedPatients.get(action).size());
        }
    }
}
