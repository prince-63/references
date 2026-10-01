package com.dentalstack.patient.feature.subscription.service;

public interface SubscriptionNotificationService {
    void clearProcessedNotifications();

    void processSubscriptionNotifications();
}
