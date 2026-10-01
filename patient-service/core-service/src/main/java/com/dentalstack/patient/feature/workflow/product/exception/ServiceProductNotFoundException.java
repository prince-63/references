package com.dentalstack.patient.feature.workflow.product.exception;

public class ServiceProductNotFoundException extends RuntimeException {
    public ServiceProductNotFoundException(String message) {
        super(message);
    }

    public ServiceProductNotFoundException(Long id) {
        super("Service Product not found with id: " + id);
    }
}
