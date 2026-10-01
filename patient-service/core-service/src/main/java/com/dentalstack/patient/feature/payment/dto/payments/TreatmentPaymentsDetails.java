package com.dentalstack.patient.feature.payment.dto.payments;

import com.dentalstack.patient.feature.payment.dto.PaymentReminderDetails;
import com.dentalstack.patient.feature.payment.enums.Status;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentPaymentsDetails {
    private long patientId;
    private long doctorId;
    private float cost;
    private float balancePayment;
    private LocalDate lastPaymentDate;

    @Builder.Default
    private Map<String, List<PaymentDetails>> payments = new TreeMap<>();

    @Builder.Default
    private List<PaymentReminderDetails> reminders = new ArrayList<>();

    public static TreatmentPaymentsDetails from(Treatment treatment) {
        var payments = new TreeMap<YearMonth, List<PaymentDetails>>();
        List<PaymentReminderDetails> reminders;
        AtomicReference<LocalDate> lastPaymentDate = new AtomicReference<>(null);

        treatment.getPayments().stream()
                .filter(payment -> payment.getStatus().equals(Status.ACTIVE))
                .forEach(payment -> {
                    var yearMonth = YearMonth.from(payment.getDate());
                    payments.computeIfAbsent(yearMonth, k -> new ArrayList<>()).add(PaymentDetails.from(payment));

                    lastPaymentDate.updateAndGet(currentLastDate ->
                            (currentLastDate == null || payment.getDate().isAfter(currentLastDate))
                                    ? payment.getDate()
                                    : currentLastDate);
                });

        if (treatment.getReminders() != null && !treatment.getReminders().isEmpty()) {
            reminders = treatment.getReminders().stream()
                    .filter(reminder -> reminder.getStatus().equals(ReminderStatus.ACTIVE))
                    .sorted(Comparator.comparing(Reminder::getCreatedAt))
                    .map(PaymentReminderDetails::from)
                    .toList();
        } else reminders = null;

        payments.forEach((yearMonth, paymentDetailsList) ->
                paymentDetailsList.sort(Comparator.comparing(PaymentDetails::getDate)));

        Map<String, List<PaymentDetails>> sortedPaymentsByMonth = new TreeMap<>();
        payments.forEach(
                (yearMonth, paymentDetailsList) -> sortedPaymentsByMonth.put(yearMonth.toString(), paymentDetailsList));

        return TreatmentPaymentsDetails.builder()
                .patientId(treatment.getPatient().getId())
                .doctorId(treatment.getDoctorId())
                .balancePayment(treatment.balancePayment())
                .cost(treatment.getCost())
                .payments(sortedPaymentsByMonth)
                .reminders(reminders)
                .lastPaymentDate(lastPaymentDate.get())
                .build();
    }
}
