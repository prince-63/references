package com.dentalstack.patient.feature.subcription.service;

public interface SubscriptionNotificationService {
    void clearProcessedNotifications();

    void processSubscriptionNotifications();
}
