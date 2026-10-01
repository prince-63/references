package com.dentalstack.chat.controller.v1;

import com.dentalstack.chat.dto.chat.*;
import com.dentalstack.chat.dto.file.RemoveFilesAndImagesRequest;
import com.dentalstack.chat.dto.responsebuilder.ResponseBuilder;
import com.dentalstack.chat.dto.responsebuilder.SuccessCode;
import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.InvalidRequestException;
import com.dentalstack.chat.exception.StatusEnum;
import com.dentalstack.chat.service.ChatService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Chat api", description = "Chat add, seen and get apis")
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/chat/v1/")
public class ChatController {

    private final ChatService chatService;

    // new add chat request
    @PostMapping(
            path = "/add/chat/request",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveChatRequest(
            @RequestParam String createChatAddRequest, @RequestParam(required = false) MultipartFile[] imageNames)
            throws Exception {
        log.info(
                imageNames == null
                        ? "No images provided"
                        : imageNames.length + " add new chat request " + createChatAddRequest);

        ObjectMapper mapper = new ObjectMapper();
        AddChatRequest chatAddRequest;

        try {
            chatAddRequest = mapper.readValue(createChatAddRequest, AddChatRequest.class);
        } catch (JsonProcessingException e) {
            throw new InvalidRequestException(
                    ErrorCode.BAD_REQUEST,
                    "Invalid request String. An issue occurred while processing the request data.");
        }

        chatService.createChatAddRequest(chatAddRequest, imageNames);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(StatusEnum.SUCCESS.getValue(), SuccessCode.OK.getCode(), "Chat added successfully")
                        .build());
    }

    @PostMapping(path = "/add/chat/event", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void addChatEvent(@RequestBody AddChatRequest createChatAddRequest) throws Exception {
        chatService.createChatAddRequest(createChatAddRequest, null);
    }

    @PostMapping("/remove-files-and-images")
    public ResponseEntity<String> removeFilesAndImages(@RequestBody RemoveFilesAndImagesRequest request) {
        chatService.removeFilesAndImages(request);
        return ResponseEntity.ok("Files and images removed successfully.");
    }

    @PostMapping("/multiple/send")
    public ResponseEntity<?> sendChatToMultiplePatient(@RequestBody AddMultipleChat addMultipleChat)
            throws IOException {

        chatService.sendMultipleChat(addMultipleChat);

        return ResponseEntity.ok("Chat has been sent successfully");
    }

    @GetMapping("/chat/details/{doctorId}/{patientId}/{roleName}")
    public ResponseEntity<?> getByChatDetailsByDoctorIdAndPatientId(
            @PathVariable(value = "doctorId") Long doctorId,
            @PathVariable(value = "patientId") Long patientId,
            @PathVariable(value = "roleName") String roleName) {
        try {
            ChatAndUnreadMessageResponse chatResponse =
                    chatService.getByChatDetailsByDoctorIdAndPatientId(doctorId, patientId, roleName);
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
                                    "Bad request" + patientId)
                            .build());
        }
    }

    @PostMapping("/unread/message/count/{doctorId}")
    public long getDoctorUnreadMessageCount(
            @PathVariable(value = "doctorId") Long doctorId, @RequestBody List<Long> patientIds) {
        return chatService.getChatUnreadMessageCount(doctorId, patientIds);
    }

    @GetMapping("/chat/details/doctor/dashboard/{doctorId}")
    public ResponseEntity<?> getByChatDetailsByDoctorId(@PathVariable(value = "doctorId") Long doctorId) {

        try {
            List<ChatMessageResponse> chatResponseList = chatService.getByChatDetailsByDoctorId(doctorId, null, null);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "Great! We have found the chat details you were looking for.")
                            .result(chatResponseList)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Apologies, we couldn't find the requested chat details at the moment." + doctorId)
                            .build());
        }
    }

    @PostMapping("/chat/message/seen")
    public ResponseEntity<?> messageSeen(@Valid @RequestBody MessageSeenRequest messageSeen) {
        chatService.seenMessage(messageSeen);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(
                                StatusEnum.SUCCESS.getValue(),
                                SuccessCode.OK.getCode(),
                                "Thank you for updating the status. I have noted that the messages have been seen.")
                        .build());
    }

    @PostMapping("/add/to/chat")
    public ResponseEntity<?> addPatientToChat(@Valid @RequestBody AddPatientToChatRequest addPatientToChatRequest) {
        chatService.addPatientToChat(addPatientToChatRequest);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(
                                StatusEnum.SUCCESS.getValue(),
                                SuccessCode.OK.getCode(),
                                "Patient has been added to the chat")
                        .build());
    }

    @GetMapping("/chat/details/patientId/{patientId}")
    public ResponseEntity<?> getChatDetailsByPatientId(@PathVariable(value = "patientId") Long patientId) {
        try {
            List<ChatResponse> chatResponse = chatService.getByPatientId(patientId);

            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.SUCCESS.getValue(),
                                    SuccessCode.OK.getCode(),
                                    "Great! We have found the chat details you were looking for.")
                            .results(chatResponse)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ResponseBuilder.builder()
                            .status(
                                    StatusEnum.FAILURE.getValue(),
                                    ErrorCode.BAD_REQUEST.getCode(),
                                    "Apologies, we couldn't find the requested chat details at the moment with this patient ID. "
                                            + patientId)
                            .build());
        }
    }

    @GetMapping("/get/gallery/{patientId}")
    public List<ChatImageUrlOfPatient> getChatImage(@PathVariable(value = "patientId") Long patientId) {
        return chatService.getChatGalleryImages(patientId);
    }

    @PostMapping("/delete/{patient_id}")
    @Operation(summary = "Delete patient chat by id")
    public void deleteByPatientId(@PathVariable("patient_id") Long patientId) {
        chatService.deleteChatByPatientId(patientId);
    }

    @GetMapping("/chat/latest-unread/{patientId}")
    public ResponseEntity<LatestUnreadMessageResponse> getLatestUnreadMessageForPatient(
            @PathVariable(value = "patientId") Long patientId) {
        LatestUnreadMessageResponse response = chatService.getLatestUnreadMessageForPatient(patientId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/chat/dismiss-popup/{chatId}/{patientId}")
    public ResponseEntity<?> dismissChatPopup(
            @PathVariable(value = "chatId") Long chatId, @PathVariable(value = "patientId") Long patientId) {
        chatService.dismissChatPopup(chatId, patientId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ResponseBuilder.builder()
                        .status(
                                StatusEnum.SUCCESS.getValue(),
                                SuccessCode.OK.getCode(),
                                "Popup dismissed successfully.")
                        .build());
    }
}
