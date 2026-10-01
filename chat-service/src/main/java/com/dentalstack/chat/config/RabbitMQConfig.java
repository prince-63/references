package com.dentalstack.chat.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String NOTIFICATION_EXCHANGE = "chat-notification-exchange";
    public static final String PUSH_NOTIFICATION_QUEUE = "chat-push-notification-queue";
    public static final String WEB_NOTIFICATION_QUEUE = "chat-web-notification-queue";
    public static final String PUSH_NOTIFICATION_ROUTING_KEY = "chat.notification.push";
    public static final String WEB_NOTIFICATION_ROUTING_KEY = "chat.notification.web";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue pushNotificationQueue() {
        return QueueBuilder.durable(PUSH_NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", NOTIFICATION_EXCHANGE + ".dlx")
                .withArgument("x-dead-letter-routing-key", "chat.notification.push.dlq")
                .build();
    }

    @Bean
    public Queue webNotificationQueue() {
        return QueueBuilder.durable(WEB_NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", NOTIFICATION_EXCHANGE + ".dlx")
                .withArgument("x-dead-letter-routing-key", "chat.notification.web.dlq")
                .build();
    }

    // Dead letter infrastructure
    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE + ".dlx", true, false);
    }

    @Bean
    public Queue pushNotificationDlq() {
        return QueueBuilder.durable(PUSH_NOTIFICATION_QUEUE + ".dlq").build();
    }

    @Bean
    public Queue webNotificationDlq() {
        return QueueBuilder.durable(WEB_NOTIFICATION_QUEUE + ".dlq").build();
    }

    @Bean
    public Binding pushNotificationBinding() {
        return BindingBuilder.bind(pushNotificationQueue())
                .to(notificationExchange())
                .with(PUSH_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding webNotificationBinding() {
        return BindingBuilder.bind(webNotificationQueue())
                .to(notificationExchange())
                .with(WEB_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding pushDlqBinding() {
        return BindingBuilder.bind(pushNotificationDlq())
                .to(deadLetterExchange())
                .with("chat.notification.push.dlq");
    }

    @Bean
    public Binding webDlqBinding() {
        return BindingBuilder.bind(webNotificationDlq())
                .to(deadLetterExchange())
                .with("chat.notification.web.dlq");
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter());
        return rabbitTemplate;
    }
}
