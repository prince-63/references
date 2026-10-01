package com.dentalstack.doctor.entity.subscription.chargebee;

import com.dentalstack.doctor.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(
        name = "chargebee_event",
        indexes = {@Index(name = "IX_chargebee_event_email", columnList = "email")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChargebeeEvent extends BaseEntity {

    private String eventId;

    private Instant occurredAt;

    private String source;

    private String object;

    private String apiVersion;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private ChargebeeEventContent content;

    private String eventType;

    private String webhookStatus;

    private String email;

    private String customerId;

    private Long systemUserId;

    private ZonedDateTime subscriptionEndDate;

    private ZonedDateTime subscriptionStartDate;

    public static ChargebeeEvent from(JsonNode eventData, ChargebeeEventContent content) {
        String email = null;
        String customerId = null;
        ZonedDateTime subscriptionEndDate = null;
        ZonedDateTime subscriptionStartDate = null;

        JsonNode contentNode = eventData.get("content");
        if (contentNode != null) {
            JsonNode customer = contentNode.get("customer");
            if (customer != null) {
                email = customer.get("email").asText(null);
                customerId = customer.get("id").asText(null);
            }

            JsonNode subscription = contentNode.get("subscription");
            if (subscription != null) {
                if (subscription.has("trial_end")) {
                    long trialEnd = subscription.get("trial_end").asLong();
                    subscriptionEndDate =
                            ZonedDateTime.ofInstant(Instant.ofEpochSecond(trialEnd), ZoneId.systemDefault());
                }

                if (subscription.has("trial_start")) {
                    long trialStart = subscription.get("trial_start").asLong();
                    subscriptionStartDate =
                            ZonedDateTime.ofInstant(Instant.ofEpochSecond(trialStart), ZoneId.systemDefault());
                }

                if (subscriptionEndDate == null && subscription.has("next_billing_at")) {
                    long nextBillingAt = subscription.get("next_billing_at").asLong();
                    subscriptionEndDate =
                            ZonedDateTime.ofInstant(Instant.ofEpochSecond(nextBillingAt), ZoneId.systemDefault());
                }

                if (subscriptionStartDate == null && subscription.has("started_at")) {
                    long startedAt = subscription.get("started_at").asLong();
                    subscriptionStartDate =
                            ZonedDateTime.ofInstant(Instant.ofEpochSecond(startedAt), ZoneId.systemDefault());
                }
            }
        }

        return ChargebeeEvent.builder()
                .eventId(eventData.get("id").asText())
                .occurredAt(Instant.ofEpochSecond(eventData.get("occurred_at").asLong()))
                .source(eventData.get("source").asText())
                .object(eventData.get("object").asText())
                .apiVersion(eventData.get("api_version").asText())
                .eventType(eventData.get("event_type").asText())
                .webhookStatus(eventData.get("webhook_status").asText())
                .content(content)
                .email(email)
                .customerId(customerId)
                .subscriptionEndDate(subscriptionEndDate)
                .subscriptionStartDate(subscriptionStartDate)
                .build();
    }
}
