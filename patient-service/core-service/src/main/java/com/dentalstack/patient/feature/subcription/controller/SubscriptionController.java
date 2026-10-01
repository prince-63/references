package com.dentalstack.patient.feature.subcription.controller;

import com.dentalstack.patient.feature.subcription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subcription.dto.SubscriptionRequest;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subscription", description = "Subscription APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/chargebee/v1")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/create/customer/subscription")
    public void createCustomerAndAddBasicPlan(@RequestBody SubscriptionRequest request) {
        subscriptionService.createCustomerAndSubscription(request);
    }

    @PostMapping("/extend/subscription")
    public void extendCurrentSubscription(@RequestBody SubscriptionPlanDTO request) throws Exception {
        subscriptionService.extendCurrentSubscription(request);
    }

    @GetMapping("/get/whatsapp/details/{doctorId}")
    public String isWhatsAppMessagingDetails(@PathVariable Long doctorId) {
        return subscriptionService.getWhatsAppDetails(doctorId);
    }
}
