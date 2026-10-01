package com.dentalstack.patient.feature.chat.websocket.listener;

import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketPresenceEvent;
import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, Integer> onlineUsers = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();

        if (user == null) {
            log.warn("WebSocket CONNECT without authenticated principal (session={})", headerAccessor.getSessionId());
            return;
        }

        String username = user.getName();
        int sessions = onlineUsers.merge(username, 1, Integer::sum);
        log.info("WebSocket CONNECT: {} (total sessions={})", username, sessions);

        if (sessions == 1) {
            broadcastPresence(username, true);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();

        if (user == null) {
            log.debug(
                    "WebSocket DISCONNECT without authenticated principal (session={})", headerAccessor.getSessionId());
            return;
        }

        String username = user.getName();
        onlineUsers.compute(username, (k, count) -> {
            if (count == null || count <= 1) return null;
            return count - 1;
        });

        boolean stillOnline = onlineUsers.containsKey(username);
        log.info("WebSocket DISCONNECT: {} (stillOnline={})", username, stillOnline);

        if (!stillOnline) {
            broadcastPresence(username, false);
        }
    }

    private void broadcastPresence(String username, boolean isOnline) {
        WebSocketPresenceEvent presenceEvent = WebSocketPresenceEvent.builder()
                .username(username)
                .isOnline(isOnline)
                .timestamp(ZonedDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/presence", presenceEvent);
        log.debug("Presence broadcast: {} is {}", username, isOnline ? "ONLINE" : "OFFLINE");
    }

    public boolean isOnline(String username) {
        return onlineUsers.containsKey(username);
    }
}
