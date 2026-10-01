package com.dentalstack.patient.feature.patient.exception;

public class AddressNotFoundException extends RuntimeException {
    public AddressNotFoundException(Long patientId, Long addressId) {
        super(String.format("Address not found with id %d for patient %d", addressId, patientId));
    }
}
