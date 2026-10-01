package com.dentalstack.patient.feature.chat.websocket.config;

import com.dentalstack.patient.feature.chat.repository.ChatParticipantRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.ArrayList;
import java.util.Base64;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ChatParticipantRepository participantRepository;

    @Value("${dentalstack.jwt.secret.token}")
    private String secretKey;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue")
                .setTaskScheduler(brokerHeartbeatScheduler())
                .setHeartbeatValue(new long[] {10000, 10000});
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.scheduling.TaskScheduler brokerHeartbeatScheduler() {
        org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler scheduler =
                new org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureWebSocketTransport(
            org.springframework.web.socket.config.annotation.WebSocketTransportRegistration registration) {
        registration.setSendBufferSizeLimit(512 * 1024).setSendTimeLimit(20_000).setMessageSizeLimit(128 * 1024);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registerEndpoint(registry, "/ws-chat");
        registerEndpoint(registry, "/patient/ws-chat");
    }

    private static final String[] WS_ALLOWED_ORIGINS = {
        "https://*.dental-stack.com",
        "https://web.smilezy.com",
        "https://web.craftalign.com",
        "https://web.routetosmile.com",
        "https://web.synapsehealthtech.in",
        "https://doctors.clearcastle.in",
        "https://doctors.smilexcel.com",
        "https://doctors.aiiqaligner.com",
        "http://localhost:*"
    };

    private void registerEndpoint(StompEndpointRegistry registry, String endpoint) {
        registry.addEndpoint(endpoint)
                .setAllowedOriginPatterns(WS_ALLOWED_ORIGINS)
                .withSockJS();
        registry.addEndpoint(endpoint).setAllowedOriginPatterns(WS_ALLOWED_ORIGINS);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) return message;

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            Claims claims = Jwts.parser()
                                    .verifyWith(signingKey())
                                    .build()
                                    .parseSignedClaims(token)
                                    .getPayload();

                            String username = claims.get("email", String.class);
                            if (username == null) {
                                username = claims.getSubject();
                            }

                            if (username != null) {
                                UsernamePasswordAuthenticationToken auth =
                                        new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
                                accessor.setUser(auth);
                                log.info("WebSocket CONNECT authenticated as principal: {}", username);
                            }
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage());
                            throw new MessageDeliveryException("Authentication failed: invalid JWT token");
                        }
                    }

                    if (accessor.getUser() == null) {
                        log.warn("WebSocket CONNECT rejected — no valid JWT provided");
                        throw new MessageDeliveryException("Authentication required for WebSocket connection");
                    }
                }

                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    java.security.Principal user = accessor.getUser();
                    String destination = accessor.getDestination();

                    if (user == null) {
                        log.warn("Unauthenticated SUBSCRIBE to {} — rejected", destination);
                        throw new MessageDeliveryException("Authentication required");
                    }

                    if (destination != null && destination.startsWith("/topic/chat/")) {
                        try {
                            String chatIdStr = destination.substring("/topic/chat/".length());
                            Long chatId = Long.parseLong(chatIdStr);
                            boolean isMember =
                                    participantRepository.existsByChatIdAndUserProfileUserEmailAndIsActiveTrue(
                                            chatId, user.getName());
                            if (!isMember) {

                                boolean isOwnerOfParticipant =
                                        participantRepository.existsParticipantWithInviterEmail(chatId, user.getName());
                                if (!isOwnerOfParticipant) {
                                    log.warn(
                                            "SUBSCRIBE denied: user={} is not a member of chatId={}",
                                            user.getName(),
                                            chatId);
                                    throw new MessageDeliveryException(
                                            "Access denied: you are not a participant of chat " + chatId);
                                }
                                log.info("SUBSCRIBE allowed for owner: user={} chatId={}", user.getName(), chatId);
                            }
                            log.debug("SUBSCRIBE allowed: user={} chatId={}", user.getName(), chatId);
                        } catch (NumberFormatException e) {
                            log.warn("Invalid chatId in subscription destination: {}", destination);
                            throw new MessageDeliveryException("Invalid chat destination");
                        }
                    }
                }

                return message;
            }
        });
    }
}
