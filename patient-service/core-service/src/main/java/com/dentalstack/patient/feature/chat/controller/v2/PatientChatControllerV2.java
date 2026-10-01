package com.dentalstack.patient.feature.chat.controller.v2;

import com.dentalstack.patient.feature.chat.dto.request.*;
import com.dentalstack.patient.feature.chat.dto.response.v2.response.ChatListResponseV2;
import com.dentalstack.patient.feature.chat.service.PatientChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v2/chats")
@RequiredArgsConstructor
@Slf4j
public class PatientChatControllerV2 {

    private final PatientChatService chatService;

    @PostMapping("/my-chats")
    public ResponseEntity<ChatListResponseV2> getMyChats(@RequestBody @Valid GetMyChatsRequest request) {

        ChatListResponseV2 response = chatService.getMyChatsV2(request);
        return ResponseEntity.ok(response);
    }
}
