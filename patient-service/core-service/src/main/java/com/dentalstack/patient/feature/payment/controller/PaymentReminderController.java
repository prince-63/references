package com.dentalstack.patient.feature.payment.controller;

import com.dentalstack.patient.feature.payment.dto.UpdatePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.payments.TreatmentPaymentsDetails;
import com.dentalstack.patient.feature.payment.dto.reminder.DeletePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.reminder.SetPaymentReminderRequest;
import com.dentalstack.patient.feature.payment.service.reminder.PaymentReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Payment Reminders", description = "Payment Reminders APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/payments/reminder/v1")
public class PaymentReminderController {

    private final PaymentReminderService paymentReminderService;

    @PostMapping
    @Operation(summary = "Set a payment reminder")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> setPaymentReminder(
            @Valid @RequestBody SetPaymentReminderRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentReminderService.setReminder(request)));
    }

    @PostMapping("/update")
    @Operation(summary = "Update a payment reminder")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> updatePaymentReminder(
            @Valid @RequestBody UpdatePaymentReminderRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentReminderService.updateReminder(request)));
    }

    @PostMapping("/delete")
    @Operation(summary = "Delete a payment reminder")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> deletePaymentReminder(
            @Valid @RequestBody DeletePaymentReminderRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentReminderService.deleteReminder(request)));
    }
}
