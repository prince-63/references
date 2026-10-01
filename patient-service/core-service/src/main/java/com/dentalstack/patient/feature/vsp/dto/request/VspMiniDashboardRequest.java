package com.dentalstack.patient.feature.vsp.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class VspMiniDashboardRequest {
    private Long profileId;
    private Long customerProfileId;
    private OrderSortBy orderSortBy;
    private PatientSortBy patientSortBy;
    private OrderBy orderBy;
    private PaginationRequest pagination;

    public enum OrderSortBy {
        ORDER_ID,
        PRODUCT_NAME,
        DATE
    }

    public enum PatientSortBy {
        PATIENT_NAME,
        CREATED_BY
    }

    public enum OrderBy {
        ASC,
        DESC
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class PaginationRequest {
        private OrderPagination orderPagination;
        private PatientPagination patientPagination;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class OrderPagination {
        private Long pageSize = 10L;
        private Long pageNo = 0L;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class PatientPagination {
        private Long pageSize = 10L;
        private Long pageNo = 0L;
    }
}
