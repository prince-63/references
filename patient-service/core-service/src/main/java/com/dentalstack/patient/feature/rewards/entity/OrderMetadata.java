package com.dentalstack.patient.feature.rewards.entity;

import java.io.Serializable;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderMetadata implements Serializable {
    private String shippingAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String phoneNumber;
    private String deliveryNotes;
    private String trackingNumber;
    private String courierService;
}
