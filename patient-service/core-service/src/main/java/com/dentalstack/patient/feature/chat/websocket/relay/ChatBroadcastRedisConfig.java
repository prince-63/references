package com.dentalstack.patient.feature.chat.websocket.relay;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class ChatBroadcastRedisConfig {

    @Bean
    public RedisMessageListenerContainer chatBroadcastListenerContainer(
            RedisConnectionFactory connectionFactory, MessageListenerAdapter chatBroadcastListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(chatBroadcastListenerAdapter, chatBroadcastTopic());
        return container;
    }

    @Bean
    public MessageListenerAdapter chatBroadcastListenerAdapter(ChatBroadcastRedisListener listener) {

        return new MessageListenerAdapter(listener, "handleMessage");
    }

    @Bean
    public ChannelTopic chatBroadcastTopic() {
        return new ChannelTopic(ChatBroadcastRedisPublisher.CHANNEL);
    }
}
