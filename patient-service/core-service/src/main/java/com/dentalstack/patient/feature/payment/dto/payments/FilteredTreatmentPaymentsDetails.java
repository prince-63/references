package com.dentalstack.patient.feature.payment.dto.payments;

import com.dentalstack.patient.feature.calendar.dto.calendar.details.PaymentCalendarDetails;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilteredTreatmentPaymentsDetails {

    private BillingAndPayments billingAndPayments;
    private PaginationDetails pagination;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BillingAndPayments {
        private String doctorId;
        private Double totalOutstanding;
        private Double dueThisMonth;
        private Double receivedThisMonth;
        private Double compareToLastMonth;
        private Double totalOutstandingByFilter;
        private Double balanceReceivedByFilter;
        private Double totalBalanceReceived;
        private List<PatientDetail> patientDetails;
        private Double totalRemainingCost;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PatientDetail {
        private String patientName;
        private Long patientId;
        private String profileUrl;
        private Long profileImageId;
        private ZonedDateTime patientCreatedOn;
        private List<String> treatments;
        private String practiceLocationName;
        private Long practiceLocationId;
        private Double treatmentCost;
        private Double balancePayment;
        private LastPaymentReceived lastPaymentReceived;
        private PatientStatus patientStatus;
        private Long doctorId;
        private PaymentCalendarDetails paymentReminderDetails;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LastPaymentReceived {
        private Double amount;
        private LocalDate receivedOn;
        private Long paymentId;
    }

    public static FilteredTreatmentPaymentsDetails from() {
        FilteredTreatmentPaymentsDetails.builder().build();
        return null;
    }
}
