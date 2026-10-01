package com.dentalstack.chat.controller.v2;

import com.dentalstack.chat.dto.chat.ChatAndUnreadMessageV2Response;
import com.dentalstack.chat.dto.chat.ChatMessageResponse;
import com.dentalstack.chat.dto.chat.GetChatDetailsRequest;
import com.dentalstack.chat.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.chat.dto.responsebuilder.SuccessCode;
import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.StatusEnum;
import com.dentalstack.chat.service.ChatService;
import com.dentalstack.chat.service.ChatServiceV2;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Chat api v2", description = "Chat add, seen and get apis v2")
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/chat/v2/")
public class ChatControllerV2 {

    private final ChatService chatService;
    private final ChatServiceV2 chatServiceV2;

    @PostMapping("/dashboard")
    public ResponseEntity<?> getByChatDetailsByDoctorId(@Valid @RequestBody GetChatDetailsRequest request) {
        var doctorId = request.getDoctorId();
        var profileId = request.getProfileId();
        var organizationId = request.getOrganizationId();
        List<ChatMessageResponse> chatResponseList =
                chatService.getByChatDetailsByDoctorId(doctorId, organizationId, profileId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(
                                StatusEnum.SUCCESS.getValue(),
                                SuccessCode.OK.getCode(),
                                "Great! We have found the chat details you were looking for.")
                        .result(chatResponseList)
                        .build());
    }

    @GetMapping("/chat/details/{doctorId}/{patientId}/{roleName}")
    public ResponseEntity<?> getByChatDetailsByDoctorIdAndPatientId(
            @PathVariable(value = "doctorId") Long doctorId,
            @PathVariable(value = "patientId") Long patientId,
            @PathVariable(value = "roleName") String roleName) {
        try {
            ChatAndUnreadMessageV2Response chatResponse =
                    chatServiceV2.getByChatDetailsByDoctorIdAndPatientId(doctorId, patientId, roleName);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "Chat found for the dashboard.")
                            .result(chatResponse)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Bad request" + Arrays.toString(e.getStackTrace()))
                            .build());
        }
    }
}
