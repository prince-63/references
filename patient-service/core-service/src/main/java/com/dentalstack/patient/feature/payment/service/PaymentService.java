package com.dentalstack.patient.feature.payment.service;

import com.dentalstack.patient.feature.payment.dto.DeletePaymentRequest;
import com.dentalstack.patient.feature.payment.dto.FilteredTreatmentPaymentsRequest;
import com.dentalstack.patient.feature.payment.dto.RegisterPaymentRequest;
import com.dentalstack.patient.feature.payment.dto.RegisterTreatmentCostRequest;
import com.dentalstack.patient.feature.payment.dto.UpdatePaymentRequest;
import com.dentalstack.patient.feature.payment.dto.payments.FilteredTreatmentPaymentsDetails;
import com.dentalstack.patient.feature.treatment.entity.Treatment;

public interface PaymentService {

    Treatment registerTreatmentCost(RegisterTreatmentCostRequest request);

    Treatment registerPayment(RegisterPaymentRequest request);

    Treatment updatePayment(UpdatePaymentRequest request);

    Treatment deletePayment(DeletePaymentRequest request);

    Treatment getTreatment(long patientId, long doctorId);

    Treatment getTreatment(long patientId);

    void paymentReminder();

    FilteredTreatmentPaymentsDetails getFilteredPayments(FilteredTreatmentPaymentsRequest request);
}
