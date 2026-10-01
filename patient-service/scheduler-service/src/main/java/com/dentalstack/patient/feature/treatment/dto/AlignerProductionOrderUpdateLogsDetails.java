package com.dentalstack.patient.feature.treatment.dto;

import static java.util.Comparator.comparing;
import static java.util.Comparator.reverseOrder;

import com.dentalstack.patient.feature.treatment.dto.production.AlignerProductionLogDetails;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionLog;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionOrderLog;
import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionOrderUpdateLogsDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Map<LocalDate, Set<AlignerProductionOrderLogDetails>> orderLogs;

    public static AlignerProductionOrderUpdateLogsDetails from(List<AlignerProductionOrderLog> orderLogs) {
        Map<LocalDate, Set<AlignerProductionOrderLogDetails>> orderLogsDetails = new TreeMap<>(reverseOrder());
        orderLogs.forEach(orderLog -> {
            var date = orderLog.getCreatedAt().toLocalDate();
            if (!orderLogsDetails.containsKey(date)) {
                orderLogsDetails.put(
                        date,
                        new TreeSet<>(comparing(AlignerProductionOrderLogDetails::getSrNo)
                                .reversed()));
            }
            var logs = orderLogsDetails.get(date);
            logs.addAll(AlignerProductionOrderLogDetails.from(orderLog));
        });

        return new AlignerProductionOrderUpdateLogsDetails(orderLogsDetails);
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlignerProductionOrderLogDetails {
        private int srNo;

        @Builder.Default
        private Set<Integer> alignerNos = new TreeSet<>();

        private String oldAlignerProductionLab;
        private String newAlignerProductionLab;

        private ProductionSubStatus oldProductionSubStatus;
        private ProductionSubStatus newProductionSubStatus;

        private ProductionStatus oldProductionStatus;
        private ProductionStatus newProductionStatus;

        private ZonedDateTime loggedAt;

        @Builder.Default
        private List<AlignerProductionLogDetails> alignerProductionLogs = new ArrayList<>();

        public static Set<AlignerProductionOrderLogDetails> from(AlignerProductionOrderLog alignerProductionOrderLog) {
            var prodOrderLogs = new TreeSet<>(
                    comparing(AlignerProductionOrderLogDetails::getSrNo).reversed());
            alignerProductionOrderLog.getAlignerProductionLogs().stream()
                    .collect(Collectors.groupingBy(AlignerProductionLog.Changes::from))
                    .forEach((changes, logs) -> {
                        var logDetails = AlignerProductionOrderLogDetails.builder()
                                .srNo(alignerProductionOrderLog.getSrNo())
                                .oldProductionStatus(changes.oldProductionStatus())
                                .newProductionStatus(changes.newProductionStatus())
                                .oldProductionSubStatus(changes.oldProductionSubStatus())
                                .newProductionSubStatus(changes.newProductionSubStatus())
                                .oldAlignerProductionLab(changes.oldAlignerProductionLab())
                                .newAlignerProductionLab(changes.newAlignerProductionLab())
                                .alignerNos(logs.stream()
                                        .map(log -> log.getAlignerProduction()
                                                .getAligner()
                                                .getSrNo())
                                        .collect(Collectors.toSet()))
                                .loggedAt(alignerProductionOrderLog.getCreatedAt())
                                .build();
                        prodOrderLogs.add(logDetails);
                    });

            return prodOrderLogs;
        }
    }
}
