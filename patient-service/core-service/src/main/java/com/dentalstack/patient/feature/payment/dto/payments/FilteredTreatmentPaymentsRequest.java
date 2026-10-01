package com.dentalstack.patient.feature.payment.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilteredTreatmentPaymentsRequest {
    private String patientSearch;
    private List<String> checkedTreatmentList;
    private List<BrandOption> checkedBrandList;
    private List<PracticeLocationOption> checkedPracticeLocationList;
    private String filterByReminder;
    private SortCriteria sortBy;
    private DateRange filterByPaymentDate;
    private Long doctorId;
    private int pageNumber;
    private int pageSize;
    private boolean isDefault;
    private Long organizationId;
    private Long profileId;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BrandOption {
        private Long value;
        private String label;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PracticeLocationOption {
        private Long value;
        private String label;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PracticeLocation {
        private Long value;
        private String label;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SortCriteria {
        private String type;
        private String sort;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DateRange {
        private LocalDate fromDate;
        private LocalDate toDate;
    }
}
