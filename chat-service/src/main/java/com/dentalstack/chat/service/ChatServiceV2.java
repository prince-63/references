package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.chat.ChatAndUnreadMessageV2Response;

public interface ChatServiceV2 {
    ChatAndUnreadMessageV2Response getByChatDetailsByDoctorIdAndPatientId(
            Long doctorId, Long patientId, String roleName);
}
