package com.dentalstack.patient.feature.payment.controller;

import com.dentalstack.patient.feature.payment.dto.*;
import com.dentalstack.patient.feature.payment.dto.FilteredTreatmentPaymentsRequest;
import com.dentalstack.patient.feature.payment.dto.RegisterPaymentRequest;
import com.dentalstack.patient.feature.payment.dto.RegisterTreatmentCostRequest;
import com.dentalstack.patient.feature.payment.dto.UpdatePaymentRequest;
import com.dentalstack.patient.feature.payment.dto.payments.FilteredTreatmentPaymentsDetails;
import com.dentalstack.patient.feature.payment.dto.payments.TreatmentPaymentsDetails;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payment", description = "Payments APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/payments/v1")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/payments/from/{patient_id}/to/{doctor_id}")
    @Operation(summary = "Get the payments done by patient to the doctor")
    @Transactional(readOnly = true)
    public ResponseEntity<TreatmentPaymentsDetails> getPayments(
            @PathVariable("patient_id") long patientId, @PathVariable("doctor_id") long doctorId) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentService.getTreatment(patientId, doctorId)));
    }

    @PostMapping("/treatment/cost")
    @Operation(summary = "Register a treatment cost")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> registerTreatmentCost(
            @Valid @RequestBody RegisterTreatmentCostRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentService.registerTreatmentCost(request)));
    }

    @PostMapping("/payment")
    @Operation(summary = "Register a new payment")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> registerPayment(
            @Valid @RequestBody RegisterPaymentRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentService.registerPayment(request)));
    }

    @PostMapping("/payment/update")
    @Operation(summary = "Update a registered payment")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> updatePayment(@Valid @RequestBody UpdatePaymentRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentService.updatePayment(request)));
    }

    @PostMapping("/payment/delete")
    @Operation(summary = "Delete a registered payment")
    @Transactional
    public ResponseEntity<TreatmentPaymentsDetails> deletePayment(
            @Valid @RequestBody com.dentalstack.patient.feature.payment.dto.DeletePaymentRequest request) {
        return ResponseEntity.ok(TreatmentPaymentsDetails.from(paymentService.deletePayment(request)));
    }

    @PostMapping("/filter")
    @Operation(summary = "Get the filtered payments")
    public ResponseEntity<FilteredTreatmentPaymentsDetails> getFilteredPayments(
            @Valid @RequestBody FilteredTreatmentPaymentsRequest request) {
        return ResponseEntity.ok(paymentService.getFilteredPayments(request));
    }
}
