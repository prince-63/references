package com.dentalstack.chat.controller.v1;

import com.dentalstack.chat.dto.notification.CreateNotification;
import com.dentalstack.chat.dto.notification.NotificationSeenRequest;
import com.dentalstack.chat.dto.notification.NotificationSendRequest;
import com.dentalstack.chat.dto.notification.WebNotificationResponse;
import com.dentalstack.chat.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.chat.dto.responsebuilder.SuccessCode;
import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.StatusEnum;
import com.dentalstack.chat.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@CrossOrigin
@Tag(name = "Notification apis", description = "Notification add, seen and get apis")
@RequiredArgsConstructor
@RestController
@RequestMapping("/notification/v1")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/add/notification/request")
    public ResponseEntity<?> CreateNotification(@RequestBody CreateNotification createNotification) {

        try {
            notificationService.createNotification(createNotification);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(StatusEnum.SUCCESS.getValue(), SuccessCode.OK.getCode(), "Notification saved")
                            .build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Notification not saved. Something went wrong.")
                            .build());
        }
    }

    @GetMapping("/get/notification/{doctorId}")
    public ResponseEntity<?> getNotificationByDoctorId(@PathVariable(value = "doctorId") Long doctorId) {
        try {
            List<WebNotificationResponse> notificationResponseList = notificationService.getNotificationList(doctorId);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(StatusEnum.SUCCESS.getValue(), SuccessCode.OK.getCode(), "Notification found")
                            .result(notificationResponseList)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Notification not found")
                            .build());
        }
    }

    @PostMapping("/notification/message/seen")
    public ResponseEntity<?> notificationSeen(@Valid @RequestBody NotificationSeenRequest notificationSeenRequest) {

        notificationService.seenNotification(notificationSeenRequest);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(
                                StatusEnum.SUCCESS.getValue(),
                                SuccessCode.OK.getCode(),
                                "Thank you for updating the status. I have noted that the notification have been seen.")
                        .build());
    }

    @PostMapping("/send/notification")
    public String notificationSend(@Valid @RequestBody NotificationSendRequest notificationSendRequest)
            throws IOException {
        String message = notificationSendRequest.getMessage();
        String mobile = notificationSendRequest.getMobile();
        String title = notificationSendRequest.getTitle();
        Long patientId = notificationSendRequest.getPatientId();
        String email = notificationSendRequest.getEmail();
        String serviceName = notificationSendRequest.getServiceName();
        String xOrgName = notificationSendRequest.getXOrgName();
        Long organizationId = notificationSendRequest.getOrganizationId();
        var alignerJourneyId = notificationSendRequest.getAlignerJourneyId();
        var alignerActionId = notificationSendRequest.getAlignerActionId();
        var globalId = notificationSendRequest.getGlobalId();
        var doctorRole = notificationSendRequest.getDoctorRole();

        int notificationIndex = notificationSendRequest.getNotificationIndex();
        if (notificationIndex != 1000) {
            // Log the notification details
            log.info(
                    "Sending Notification: Title: {}, Message: {}, PatientId: {}, Mobile: {}, Email: {}, AlignerJourneyId: {}, AlignerActionId: {}, GlobalId: {}, serviceName: {}, NotificationIndex: {}, XOrgName: {}, organizationId: {}",
                    title,
                    message,
                    patientId,
                    mobile,
                    email,
                    alignerJourneyId,
                    alignerActionId,
                    globalId,
                    serviceName,
                    notificationIndex,
                    xOrgName,
                    organizationId);
            notificationService.sendNotification(
                    message,
                    mobile,
                    title,
                    notificationIndex,
                    notificationSendRequest.getIsDoctorApp(),
                    patientId,
                    email,
                    alignerJourneyId,
                    alignerActionId,
                    globalId,
                    serviceName,
                    doctorRole,
                    xOrgName,
                    organizationId);
        }
        return "Notification Sent";
    }
}
