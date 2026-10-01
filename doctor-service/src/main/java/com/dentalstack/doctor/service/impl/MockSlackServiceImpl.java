package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.service.SlackService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("local | dev | stage")
public class MockSlackServiceImpl implements SlackService {
    @Override
    public void sendSlackNotification(Doctor doctor, boolean isNewDoctor) {}
}
