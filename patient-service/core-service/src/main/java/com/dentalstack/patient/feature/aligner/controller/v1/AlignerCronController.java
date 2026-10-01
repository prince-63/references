package com.dentalstack.patient.feature.aligner.controller.v1;

import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import com.dentalstack.patient.feature.tracking.service.TrackingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Aligner crons", description = "Aligner cron APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/notifications/v1")
public class AlignerCronController {

    private final AlignerService alignerService;

    private final PaymentService paymentService;

    private final TrackingService trackingService;
    private final NotificationService notificationService;

    @PostMapping("/daily")
    public void triggerNotifications() {
        alignerService.sendNotifications();
    }
}
