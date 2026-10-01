package com.dentalstack.patient.feature.order.dto;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FilteredOrderDetails {
    private List<OrderDetails> orderDetails;
    private PaginationDetails paginationDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderDetails {
        private String orderId;
        private Boolean caseSubmitted;
        private Long doctorId;
        private Long doctorProfileId;
        private String doctorName;
        private Long patientId;
        private String patientName;
        private ZonedDateTime orderCreationDate;
        private OrderType orderType;
        private OrderStatus orderStatus;
        private LocalDate orderDueBy;
        private Boolean isUrgent;
        private String assignedLabUserName;
        private Long assignedLabUserId;
        private String linkedOrderId;
        private String labDisplayName;
        private Long labProfileId;
        private ManufacturingResponse latestManufacturingResponse;
        private AlignerInfo unprocessedAlignerDetails;
        private Boolean isPracticeOrder;
        private Boolean isCustomerOrder;
        private String needMoreInfoRemark;
        private Boolean isNeedMoreInfoUpdated;
        private String cancelOrderRemark;
        private ZonedDateTime cancelledOn;
        private ZonedDateTime needMoreInfoUpdatedOn;
        private JsonNode serviceProducts;
    }

    @Builder
    @Data
    public static class PaginationDetails {
        private int pageNumber;
        private int pageSize;
        private long totalOrders;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
        private int sent;
        private int received;
        private int receivedByPractice;
        private int receivedByCustomer;
    }
}
