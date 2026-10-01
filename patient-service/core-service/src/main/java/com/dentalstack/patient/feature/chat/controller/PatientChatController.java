package com.dentalstack.patient.feature.chat.controller;

import com.dentalstack.patient.feature.chat.dto.request.*;
import com.dentalstack.patient.feature.chat.dto.response.*;
import com.dentalstack.patient.feature.chat.service.PatientChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/chats")
@RequiredArgsConstructor
@Slf4j
public class PatientChatController {

    private final PatientChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> createChat(@Valid @RequestBody CreateChatRequest request) {
        ChatResponse response = chatService.createChat(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/get-by-id")
    public ResponseEntity<ChatResponse> getChatById(@Valid @RequestBody GetChatRequest request) {

        ChatResponse response = chatService.getChatById(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ChatResponse> getChatByPatientId(
            @PathVariable Long patientId, @RequestParam("profile_id") Long currentUserProfileId) {

        ChatResponse response = chatService.getChatByPatientId(patientId, currentUserProfileId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/my-chats")
    public ResponseEntity<ChatListResponse> getMyChats(@RequestBody @Valid GetMyChatsRequest request) {

        ChatListResponse response = chatService.getMyChats(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unread")
    public ResponseEntity<ChatListResponse> getUnreadChats(@RequestBody @Valid GetMyChatsRequest request) {

        ChatListResponse response = chatService.getUnreadChats(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam("profile_id") Long currentUserProfileId) {

        Long count = chatService.getUnreadCount(currentUserProfileId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/participants")
    public ResponseEntity<ChatResponse> addParticipants(@Valid @RequestBody AddParticipantsRequest request) {

        log.info("Adding participants to chat: {}", request.getChatId());
        ChatResponse response = chatService.addParticipants(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{chatId}/participants/{userProfileId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable Long chatId,
            @PathVariable Long userProfileId,
            @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Removing participant {} from chat {}", userProfileId, chatId);
        chatService.removeParticipant(chatId, userProfileId, currentUserProfileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{chatId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long chatId, @RequestParam("profile_id") Long currentUserProfileId) {

        chatService.markAsRead(chatId, currentUserProfileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/typing")
    public ResponseEntity<Void> updateTypingStatus(
            @Valid @RequestBody UpdateTypingStatusRequest request,
            @RequestParam("profile_id") Long currentUserProfileId) {

        chatService.updateTypingStatus(request, currentUserProfileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/online")
    public ResponseEntity<Void> updateOnlineStatus(
            @RequestParam Boolean isOnline, @RequestParam("profile_id") Long currentUserProfileId) {

        chatService.updateOnlineStatus(currentUserProfileId, isOnline);
        return ResponseEntity.noContent().build();
    }
}
