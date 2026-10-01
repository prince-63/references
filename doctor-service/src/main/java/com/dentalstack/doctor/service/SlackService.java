package com.dentalstack.doctor.service;

import com.dentalstack.doctor.entity.Doctor;

public interface SlackService {
    void sendSlackNotification(Doctor doctor, boolean isNewDoctor);
}
