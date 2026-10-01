package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.order.util.CustomerActionPendingMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EnterpriseDashboardOrdersResponse {
    private PracticeOrders practiceOrders;
    private CustomerOrders customerOrders;
    private LabOrder labOrder;

    public static EnterpriseDashboardOrdersResponse from(
            OrdersCountResponse practiceOrders, OrdersCountResponse customerOrders, OrdersCountResponse labOrders) {

        return EnterpriseDashboardOrdersResponse.builder()
                .practiceOrders(PracticeOrders.from(practiceOrders))
                .customerOrders(CustomerOrders.from(customerOrders))
                .labOrder(LabOrder.from(labOrders))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PracticeOrders {
        private Count count;
        private Task task;
        private NeedsAttention needsAttention;
        private CustomerActionPending customerActionPending;

        public static PracticeOrders from(OrdersCountResponse response) {
            if (response == null) {
                return new PracticeOrders();
            }

            return PracticeOrders.builder()
                    .count(Count.from(response.getCount()))
                    .task(Task.from(response.getTask()))
                    .needsAttention(NeedsAttention.from(response))
                    .customerActionPending(CustomerActionPending.from(response))
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerOrders {
        private Count count;
        private Task task;
        private NeedsAttention needsAttention;
        private CustomerActionPending customerActionPending;

        public static CustomerOrders from(OrdersCountResponse response) {
            if (response == null) {
                return new CustomerOrders();
            }

            return CustomerOrders.builder()
                    .count(Count.from(response.getCount()))
                    .task(Task.from(response.getTask()))
                    .needsAttention(NeedsAttention.from(response))
                    .customerActionPending(CustomerActionPending.from(response))
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LabOrder {
        private Count count;
        private Task task;
        private NeedsAttention needsAttention;
        private CustomerActionPending customerActionPending;

        public static LabOrder from(OrdersCountResponse response) {
            if (response == null) {
                return new LabOrder();
            }

            return LabOrder.builder()
                    .count(Count.from(response.getCount()))
                    .task(Task.from(response.getTask()))
                    .needsAttention(NeedsAttention.from(response))
                    .customerActionPending(CustomerActionPending.from(response))
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Count {
        private Long total;
        private Long ordered;
        private Long inProgress;
        private Long inReview;
        private Long replan;
        private Long approved;
        private Long completed;
        private Long stlFilesRequested;
        private Long stlFilesUploaded;

        public static Count from(OrdersCountResponse.Count count) {
            if (count == null) {
                return new Count();
            }

            return Count.builder()
                    .total(count.getTotal() != null ? count.getTotal() : 0L)
                    .ordered(count.getOrdered() != null ? count.getOrdered() : 0L)
                    .inProgress(count.getInProgress() != null ? count.getInProgress() : 0L)
                    .inReview(count.getInReview() != null ? count.getInReview() : 0L)
                    .replan(count.getReplan() != null ? count.getReplan() : 0L)
                    .approved(count.getApproved() != null ? count.getApproved() : 0L)
                    .completed(count.getCompleted() != null ? count.getCompleted() : 0L)
                    .stlFilesRequested(count.getStlFileRequested() != null ? count.getStlFileRequested() : 0L)
                    .stlFilesUploaded(count.getStlFileApproved() != null ? count.getStlFileApproved() : 0L)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Task {
        private Long inProgress;
        private Long reviewAssignedOrdersToMe;

        public static Task from(OrdersCountResponse.TaskDetails task) {
            if (task == null) {
                return new Task();
            }

            return Task.builder()
                    .inProgress(task.getInProgress() != null ? task.getInProgress() : 0L)
                    .reviewAssignedOrdersToMe(
                            task.getReviewAssignedOrdersToMe() != null ? task.getReviewAssignedOrdersToMe() : 0L)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NeedsAttention {
        private Long urgentOrders;
        private Long inReplan;
        private Long dueToday;
        private Long overdue;
        private Long stlFilesRequested;

        public static NeedsAttention from(OrdersCountResponse response) {
            if (response == null) {
                return new NeedsAttention();
            }

            OrdersCountResponse.NeedsAttentionDetails needsAttention = response.getNeedsAttention();
            OrdersCountResponse.TaskDetails taskDetails = response.getTask();

            return NeedsAttention.builder()
                    .urgentOrders(
                            taskDetails != null && taskDetails.getUrgentOrders() != null
                                    ? taskDetails.getUrgentOrders()
                                    : 0L)
                    .inReplan(
                            needsAttention != null && needsAttention.getInReplan() != null
                                    ? needsAttention.getInReplan()
                                    : 0L)
                    .dueToday(
                            needsAttention != null && needsAttention.getDueToday() != null
                                    ? needsAttention.getDueToday()
                                    : 0L)
                    .overdue(
                            needsAttention != null && needsAttention.getOverdue() != null
                                    ? needsAttention.getOverdue()
                                    : 0L)
                    .stlFilesRequested(
                            needsAttention != null && needsAttention.getStlFileRequested() != null
                                    ? needsAttention.getStlFileRequested()
                                    : 0L)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerActionPending {
        private Long active;
        private Long invited;
        private Long inReview;
        private Long approved;
        private Long stlFilesUploaded;

        public static CustomerActionPending from(OrdersCountResponse response) {
            var mapped = CustomerActionPendingMapper.from(response);
            return CustomerActionPending.builder()
                    .active(mapped.active())
                    .invited(mapped.invited())
                    .inReview(mapped.inReview())
                    .approved(mapped.approved())
                    .stlFilesUploaded(mapped.stlFilesUploaded())
                    .build();
        }
    }
}
