package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.treatment.dto.production.AlignerProductionOrderReminderDetails;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProduction;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionOrder;
import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerProductionPatientWiseOrderDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<Order> orders;
    private TotalOrderDetails totalOrders;

    public static AlignerProductionPatientWiseOrderDetails from(
            List<AlignerProductionOrder> orders, Set<ProductionStatus> allowedStatuses) {

        List<Order> filteredOrders = new ArrayList<>();
        Map<ProductionStatus, Integer> statusWiseTotalOrders = new EnumMap<>(ProductionStatus.class);

        for (AlignerProductionOrder order : orders) {
            boolean shouldInclude = false;

            for (AlignerProduction production : order.getAlignerProductions()) {
                ProductionStatus status = production.getStatus();
                statusWiseTotalOrders.put(status, statusWiseTotalOrders.getOrDefault(status, 0) + 1);
                if (allowedStatuses.contains(status)) {
                    shouldInclude = true;
                }
            }

            if (shouldInclude) {
                filteredOrders.add(Order.from(order, allowedStatuses));
            }
        }

        return new AlignerProductionPatientWiseOrderDetails(
                filteredOrders, new TotalOrderDetails(orders.size(), statusWiseTotalOrders));
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TotalOrderDetails implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private int totalOrders;
        private Map<ProductionStatus, Integer> statusWiseTotalOrders;

        public static TotalOrderDetails from(List<AlignerProductionOrder> orders) {
            var statusWiseTotalOrders = new HashMap<ProductionStatus, Integer>();
            for (var status : ProductionStatus.values()) {
                var count = orders.stream()
                        .filter(order -> order.getAlignerProductions().stream()
                                .anyMatch(alignerProduction ->
                                        alignerProduction.getStatus().equals(status)))
                        .count();
                statusWiseTotalOrders.put(status, (int) count);
            }

            return new TotalOrderDetails(orders.size(), statusWiseTotalOrders);
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Order implements Comparable<Order>, Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private PatientDetails patient;
        private AlignerJourneyDetails alignerJourney;
        private Map<ProductionStatus, AlignersInOrderWithStatus> alignersWithStatus = new HashMap<>();
        private List<AlignerProductionOrderReminderDetails> reminders = new ArrayList<>();

        public static Order from(AlignerProductionOrder order, Set<ProductionStatus> allowedStatuses) {
            var alignerJourney = order.getAlignerJourney();
            var patient = alignerJourney.getPatient();
            var alignersWithStatus = new HashMap<ProductionStatus, AlignersInOrderWithStatus>();
            order.getAlignerProductions().stream()
                    .filter(production -> allowedStatuses.contains(production.getStatus()))
                    .forEach(production -> {
                        var subStatus = production.getSubStatus();
                        var status = ProductionStatus.of(subStatus);
                        var alignersInOrder = alignersWithStatus.getOrDefault(status, new AlignersInOrderWithStatus());
                        alignersInOrder.addAligner(subStatus, production.getAligner());
                        alignersWithStatus.put(status, alignersInOrder);
                    });

            return new Order(
                    PatientDetails.from(patient),
                    AlignerJourneyDetails.from(alignerJourney),
                    alignersWithStatus,
                    order.getReminders().stream()
                            .filter(r -> r.getStatus().equals(ReminderStatus.ACTIVE))
                            .map(AlignerProductionOrderReminderDetails::from)
                            .toList());
        }

        @Override
        public int compareTo(Order o) {
            if (this.reminders.size() == o.reminders.size()) {
                return this.patient.fullName().compareTo(o.getPatient().fullName());
            }

            return Integer.compare(this.reminders.size(), o.getReminders().size());
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlignersInOrderWithStatus implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private int totalAligners = 0;
        private LocalDate startDate;
        private Map<ProductionSubStatus, AlignersInOrderWithSubStatus> alignersWithSubStatus = new HashMap<>();
        private long orderStartDateOffset;

        public void addAligner(ProductionSubStatus subStatus, Aligner aligner) {
            totalAligners += 1;
            if (startDate == null || aligner.getStartDate().isBefore(startDate)) {
                startDate = aligner.getStartDate();
            }
            if (startDate != null) {
                orderStartDateOffset = LocalDate.now().until(startDate, ChronoUnit.DAYS);
            }

            var alignersInOrder = alignersWithSubStatus.getOrDefault(subStatus, new AlignersInOrderWithSubStatus());
            alignersInOrder.addAligner(aligner);
            alignersWithSubStatus.put(subStatus, alignersInOrder);
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlignersInOrderWithSubStatus implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private int totalAligners = 0;
        private LocalDate startDate;
        private Set<AlignerDetails> aligners = new TreeSet<>(new SerializableComparator());

        public void addAligner(Aligner aligner) {
            totalAligners += 1;
            if (startDate == null || aligner.getStartDate().isBefore(startDate)) {
                startDate = aligner.getStartDate();
            }

            aligners.add(AlignerDetails.from(aligner));
        }

        private static class SerializableComparator implements Comparator<AlignerDetails>, Serializable {
            @Serial
            private static final long serialVersionUID = 1L;

            @Override
            public int compare(AlignerDetails o1, AlignerDetails o2) {
                return o1.getSrNo();
            }
        }
    }
}
