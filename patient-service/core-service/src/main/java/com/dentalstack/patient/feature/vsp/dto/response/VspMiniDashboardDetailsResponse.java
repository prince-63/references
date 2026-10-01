package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.time.LocalDateTime;
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
public class VspMiniDashboardDetailsResponse {

    private Long totalPatients;
    private Long totalCustomerOrders;
    private LocalDateTime lastOrderAt;

    private Boolean customerTrackingEnabled;
    private Boolean customerStlFileViewEnabled;
    private Boolean customerScanFileViewEnabled;
    private Boolean customerPrintFileViewEnabled;

    private VspOrderDetails vspOrderDetails;
    private VspPatientDetails vspPatientDetails;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class VspOrderDetails {
        private PaginationDetails paginationDetails;
        private List<OrderInfo> orderInfoList;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderInfo {
        private Long patientId;
        private String patientUUID;
        private String patientName;
        private String orderId;
        private String serviceProductName;
        private String orderType;
        private ZonedDateTime createdOn;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class VspPatientDetails {
        private PaginationDetails paginationDetails;
        private List<PatientInfo> patientInfoList;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PatientInfo {
        private Long patientId;
        private String patientUUID;
        private String patientName;
        private String createdBy;
    }
}
