package com.dentalstack.patient.feature.chargebee;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChargebeeEventContent {
    private Customer customer;
    private Card card;
    private Subscription subscription;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Customer {
        private String id;
        private String firstName;
        private String lastName;
        private String email;
        private BillingAddress billingAddress;
        private PaymentMethod paymentMethod;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BillingAddress {
        private String firstName;
        private String lastName;
        private String line1;
        private String city;
        private String stateCode;
        private String state;
        private String country;
        private String zip;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PaymentMethod {
        private String object;
        private String type;
        private String referenceId;
        private String gateway;
        private String gatewayAccountId;
        private String status;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Card {
        private String status;
        private String gateway;
        private String gatewayAccountId;
        private String firstName;
        private String lastName;
        private String iin;
        private String last4;
        private String cardType;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Subscription {
        private String id;
        private int billingPeriod;
        private String billingPeriodUnit;
        private String customerId;
        private String status;
        private long currentTermStart;
        private long currentTermEnd;
        private long nextBillingAt;
        private long createdAt;
        private long startedAt;
        private long activatedAt;
        private String createdFromIp;
        private long updatedAt;
        private boolean hasScheduledChanges;
        private String paymentSourceId;
        private String channel;
        private long resourceVersion;
        private boolean deleted;
        private String object;
        private String currencyCode;
        private SubscriptionItem[] subscriptionItems;
        private ItemTier[] itemTiers;
        private ShippingAddress shippingAddress;
        private int dueInvoicesCount;
        private int mrr;
        private boolean hasScheduledAdvanceInvoices;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class SubscriptionItem {
            private String itemPriceId;
            private String itemType;
            private int quantity;
            private int unitPrice;
            private int amount;
            private int freeQuantity;
            private String object;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ItemTier {
            private String itemPriceId;
            private int startingUnit;
            private int endingUnit;
            private int price;
            private String object;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class ShippingAddress {
            private String firstName;
            private String lastName;
            private String line1;
            private String city;
            private String stateCode;
            private String state;
            private String country;
            private String zip;
            private String validationStatus;
            private String object;
        }
    }

    public int getSubscriptionQuantity() {
        if (this.subscription != null
                && this.subscription.subscriptionItems != null
                && this.subscription.subscriptionItems.length > 0) {
            return this.subscription.subscriptionItems[0].quantity;
        }
        return 0;
    }
}
