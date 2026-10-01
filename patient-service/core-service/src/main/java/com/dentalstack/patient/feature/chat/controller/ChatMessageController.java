package com.dentalstack.patient.feature.chat.controller;

import com.dentalstack.patient.feature.chat.dto.request.GetMessagesByChatRequest;
import com.dentalstack.patient.feature.chat.dto.request.SendMessageRequest;
import com.dentalstack.patient.feature.chat.dto.response.MessageListResponse;
import com.dentalstack.patient.feature.chat.dto.response.MessageResponse;
import com.dentalstack.patient.feature.chat.service.ChatMessageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import java.time.ZonedDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/patient/v1/messages")
@RequiredArgsConstructor
@Slf4j
public class ChatMessageController {

    private final ChatMessageService messageService;
    private final ObjectMapper mapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Send a message")
    public ResponseEntity<MessageResponse> sendMessage(
            @Parameter(
                            name = "sendMessageRequest",
                            example =
                                    """
                            {
                              "chatId": 1,
                              "profileId": 49,
                              "doctorId": 49,
                              "patientId": 213,
                              "messageType": "TEXT",
                              "textContent": "Hello, how are you?",
                              "replyToMessageId": null
                            }
                            """)
                    @Valid
                    @RequestParam("sendMessageRequest")
                    String sendMessageRequest,
            @RequestPart(value = "files", required = false) MultipartFile[] files) {

        SendMessageRequest request;
        try {
            request = mapper.readValue(sendMessageRequest, SendMessageRequest.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse send message request: " + e.getMessage(), e);
        }

        log.info("Sending message to chat: {}", request.getChatId());
        MessageResponse response = messageService.sendMessage(request, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<MessageResponse> getMessage(
            @PathVariable Long messageId, @RequestParam("profile_id") Long currentUserProfileId) {

        MessageResponse response = messageService.getMessage(messageId, currentUserProfileId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<MessageListResponse> getMessagesByChat(@Valid @RequestBody GetMessagesByChatRequest request) {
        MessageListResponse response = messageService.getMessagesByChat(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/vsp/chat")
    public ResponseEntity<MessageListResponse> getVspMessagesByChat(
            @Valid @RequestBody GetMessagesByChatRequest request) {
        MessageListResponse response = messageService.getVspMessagesByChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chat/{chatId}/before")
    public ResponseEntity<MessageListResponse> getMessagesBeforeTimestamp(
            @PathVariable Long chatId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime beforeTimestamp,
            @RequestParam("profile_id") Long currentUserProfileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);
        MessageListResponse response =
                messageService.getMessagesBeforeTimestamp(chatId, beforeTimestamp, currentUserProfileId, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId, @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Deleting message: {}", messageId);
        messageService.deleteMessage(messageId, currentUserProfileId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable Long messageId,
            @RequestParam String content,
            @RequestParam("profile_id") Long currentUserProfileId) {

        log.info("Editing message: {}", messageId);
        MessageResponse response = messageService.editMessage(messageId, content, currentUserProfileId);
        return ResponseEntity.ok(response);
    }
}
