package com.dentalstack.patient.feature.faq.exception;

public class FAQNotFoundException extends RuntimeException {
    public FAQNotFoundException(Long faqId) {
        super(String.format("FAQ not found with id %d", faqId));
    }
}
