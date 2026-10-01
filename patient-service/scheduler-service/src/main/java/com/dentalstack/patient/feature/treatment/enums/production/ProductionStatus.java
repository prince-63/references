package com.dentalstack.patient.feature.treatment.enums.production;

import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum ProductionStatus implements Serializable {
    UNTRACKED(Collections.singletonList(ProductionSubStatus.UNTRACKED), "Aligner not tracked on DS"),
    UNPROCESSED(Collections.singletonList(ProductionSubStatus.UNPROCESSED), "Unprocessed"),
    IN_MANUFACTURING(
            List.of(ProductionSubStatus.IN_PRINTING, ProductionSubStatus.IN_PRODUCTION, ProductionSubStatus.IN_TRANSIT),
            "In manufacturing"),
    IN_INVENTORY(Collections.singletonList(ProductionSubStatus.IN_INVENTORY), "In inventory"),
    ISSUED_TO_PATIENT(Collections.singletonList(ProductionSubStatus.ISSUED_TO_PATIENT), "Issued to the patient"),
    COMPLETED(
            Collections.singletonList(ProductionSubStatus.COMPLETED),
            "Patient has already worn and changed these aligner");

    private static final Map<ProductionSubStatus, ProductionStatus> statusOfSubStatus = new HashMap<>();

    static {
        for (var status : ProductionStatus.values()) {
            for (var subStatus : status.getSubStatuses()) {
                statusOfSubStatus.put(subStatus, status);
            }
        }
    }

    private final List<ProductionSubStatus> subStatuses;
    private final String description;

    public static ProductionStatus of(ProductionSubStatus subStatus) {
        if (subStatus == null) return null;

        var status = statusOfSubStatus.get(subStatus);
        if (status == null) {
            throw new IllegalArgumentException(String.format("Status of sub-status %s not found", subStatus));
        }
        return status;
    }
}
