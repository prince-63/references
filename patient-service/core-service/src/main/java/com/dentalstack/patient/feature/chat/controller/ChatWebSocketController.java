package com.dentalstack.patient.feature.chat.controller;

import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketReadReceiptEvent;
import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketTypingEvent;
import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.type")
    public void handleTypingEvent(@Payload WebSocketTypingEvent typingEvent, Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated typing event received – ignoring");
            return;
        }

        typingEvent.setTimestamp(ZonedDateTime.now());

        log.debug(
                "Typing event: user={} chatId={} isTyping={}",
                typingEvent.getUserName(),
                typingEvent.getChatId(),
                typingEvent.getIsTyping());

        messagingTemplate.convertAndSend("/topic/chat/" + typingEvent.getChatId(), typingEvent);
    }

    @MessageMapping("/chat.read")
    public void handleReadReceipt(@Payload WebSocketReadReceiptEvent readEvent, Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated read-receipt – ignoring");
            return;
        }

        readEvent.setReadAt(ZonedDateTime.now());

        log.debug(
                "Read receipt: reader={} chatId={} messages={}",
                readEvent.getReaderName(),
                readEvent.getChatId(),
                readEvent.getMessageIds());

        messagingTemplate.convertAndSend("/topic/chat/" + readEvent.getChatId(), readEvent);
    }

    @MessageMapping("/chat.send")
    public void handleSendMessage(@Payload Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            log.warn("Unauthenticated chat.send received – ignoring");
            return;
        }

        Object chatIdRaw = payload.get("chatId");
        log.info(
                "WebSocket chat.send received from {} for chatId={}. "
                        + "Message persistence is handled by the REST API; "
                        + "this handler acknowledges receipt only.",
                principal.getName(),
                chatIdRaw);

        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/errors",
                "chat.send via WebSocket is not supported for persistence. Please use the REST API.");
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Throwable exception) {
        log.error("WebSocket message processing error: {}", exception.getMessage(), exception);
        return "Error: " + exception.getMessage();
    }
}
