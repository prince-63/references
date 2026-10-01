package com.dentalstack.chat.service;

public interface SchedulerService {

    void sendMailForUnseenChat(Long patientId, Long doctorId) throws Exception;
}
