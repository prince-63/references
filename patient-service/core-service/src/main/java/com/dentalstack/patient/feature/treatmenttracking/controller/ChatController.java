package com.dentalstack.patient.feature.treatmenttracking.controller;

import com.dentalstack.patient.feature.treatmenttracking.dto.chat.AlignerReviewRequest;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.ChatHistoryResponse;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.SendMessageRequest;
import com.dentalstack.patient.feature.treatmenttracking.enums.SenderType;
import com.dentalstack.patient.feature.treatmenttracking.service.TrackingChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/tracking/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final TrackingChatService chatService;

    @PostMapping("/doctor/send")
    public ResponseEntity<Void> doctorSend(
            @RequestBody SendMessageRequest request, @AuthenticationPrincipal Long doctorUserId) {

        chatService.sendMessage(request, doctorUserId, SenderType.DOCTOR);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/patient/send")
    public ResponseEntity<Void> patientSend(
            @RequestBody SendMessageRequest request, @AuthenticationPrincipal Long patientUserId) {

        chatService.sendMessage(request, patientUserId, SenderType.PATIENT);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ChatHistoryResponse> getChatHistory(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {

        return ResponseEntity.ok(chatService.getChatHistory(patientId, page, size));
    }

    @PatchMapping("/patient/{patientId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long patientId, @AuthenticationPrincipal Long readerUserId) {

        chatService.markAsRead(patientId, readerUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/patient/aligner-review")
    public ResponseEntity<Void> submitAlignerReview(
            @RequestBody AlignerReviewRequest request, @AuthenticationPrincipal Long patientUserId) {

        chatService.submitAlignerReview(request, patientUserId);
        return ResponseEntity.ok().build();
    }
}
