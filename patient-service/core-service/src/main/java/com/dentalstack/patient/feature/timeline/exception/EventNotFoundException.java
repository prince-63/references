package com.dentalstack.patient.feature.timeline.exception;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(Long eventId) {
        super(String.format("Event not found with id %s", eventId));
    }
}
