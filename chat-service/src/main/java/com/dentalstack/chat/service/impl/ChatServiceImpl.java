package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.client.PatientServiceClient;
import com.dentalstack.chat.config.WhatsappTemplateTypeProperties;
import com.dentalstack.chat.dto.chat.*;
import com.dentalstack.chat.dto.doctor.DoctorDetails;
import com.dentalstack.chat.dto.doctor.DoctorForChatService;
import com.dentalstack.chat.dto.doctor.SuperAdminRequest;
import com.dentalstack.chat.dto.file.*;
import com.dentalstack.chat.dto.notification.PushNotificationEvent;
import com.dentalstack.chat.dto.notification.WebNotificationEvent;
import com.dentalstack.chat.dto.patient.PatientDetails;
import com.dentalstack.chat.dto.timeline.InactivateEventsRequest;
import com.dentalstack.chat.dto.whatsapp.WhatsAppRequest;
import com.dentalstack.chat.entity.Chat;
import com.dentalstack.chat.entity.DoctorPatientChat;
import com.dentalstack.chat.enums.OrgName;
import com.dentalstack.chat.enums.UserType;
import com.dentalstack.chat.enums.event.EventType;
import com.dentalstack.chat.enums.language.Language;
import com.dentalstack.chat.exception.ErrorCode;
import com.dentalstack.chat.exception.InvalidRequestException;
import com.dentalstack.chat.metadata.MessageSentToDoctorEventMetadata;
import com.dentalstack.chat.metadata.MessageSentToPatientEventMetadata;
import com.dentalstack.chat.metadata.ReminderSentToPatientEventMetadata;
import com.dentalstack.chat.repository.ChatRepository;
import com.dentalstack.chat.repository.DoctorPatientChatRepository;
import com.dentalstack.chat.service.*;
import com.dentalstack.chat.service.whatsapp.WhatsAppService;
import com.dentalstack.chat.summary.ChatSummary;
import com.dentalstack.chat.summary.ChatSummaryDetail;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;

    private final NotificationService notificationService;

    private final NotificationProducer notificationProducer;

    private final DoctorPatientChatRepository doctorPatientChatRepository;

    private final PatientService patientService;
    private final DoctorService doctorService;

    private final PatientServiceClient patientServiceClient;

    private final MessageSource messageSource;

    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;

    private final WhatsAppService whatsAppService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(value = "transactionManager")
    public void createChatAddRequest(AddChatRequest request, MultipartFile[] imageNames) throws Exception {
        Chat chat = new Chat();

        var superAdminDetails = patientService.getSuperAdminDetails(
                SuperAdminRequest.builder().doctorId(request.getDoctorId()).build());
        if (superAdminDetails != null) {
            request.setDoctorId(superAdminDetails.getDoctorId());
        }
        String imageUrls = "";
        List<Long> fileIds = new ArrayList<>();
        if (imageNames != null && imageNames.length > 0) {
            UploadResult uploadResult = processAndUploadImages(request, imageNames);
            imageUrls = uploadResult.getImageUrls();
            fileIds = uploadResult.getFileIds();
        }

        if (request.getRoleName().equalsIgnoreCase("patient")) {
            DoctorPatientChat latestChatEntry =
                    doctorPatientChatRepository.findTopByPatientIdAndDoctorIdOrderByCreatedAtDesc(
                            request.getPatientId(), request.getDoctorId());
            if (latestChatEntry == null) {
                // If no entry exists, create a new one
                DoctorPatientChat newEntry = new DoctorPatientChat();
                newEntry.setPatientId(request.getPatientId());
                newEntry.setDoctorId(request.getDoctorId());
                newEntry.setIsAdded(true); // Set to true to indicate the patient is added to the chat
                doctorPatientChatRepository.save(newEntry);
            }
        }

        ChatPatientResponse patientForChatService = patientService.getPatientResponse(request.getPatientId());

        DoctorForChatService doctorForChatService =
                doctorService.callGetDoctorForChat(request.getDoctorId(), request.getPatientId());
        DoctorDetails doctorDetails = doctorService.getDoctor(request.getDoctorId());

        chat.setMessage(request.getMessage());
        chat.setPatientId(request.getPatientId());
        chat.setDoctorId(request.getDoctorId());
        if (request.getImageName() != null) {
            chat.setImageName(request.getImageName());
        } else {
            chat.setImageName("");
        }
        chat.setCreatedBy(request.getCreatedBy());
        chat.setMessageRead(false);
        chat.setRoleName(request.getRoleName());
        chat.setActive(true);
        chat.setCreatedAt(LocalDateTime.now());
        chat.setImageName(imageUrls);
        chat.setFileIds(fileIds);
        chat.setAdditionalData(request.getAdditionalData());
        chatRepository.save(chat);

        // Notify via WebSocket with ChatResponse DTO for frontend compatibility
        ChatPatientResponse patientResponse = patientService.getPatientResponse(request.getPatientId());
        Long alignerJourneyId = patientService.getAlignerJourneyIdOfPatient(request.getPatientId());
        ChatResponse chatResponse = ChatResponse.from(chat, patientResponse, alignerJourneyId);
        messagingTemplate.convertAndSend("/topic/messages/" + request.getPatientId(), chatResponse);

        String doctorName = doctorForChatService.getDoctorName();
        if (request.getRoleName().equalsIgnoreCase("Doctor")) {

            var patient = patientService.getPatientDetails(request.getPatientId());

            ResponseEntity<String> messageResponse = sendNotification(doctorName, patient, "message.received");

            patientService.addEvent(
                    request.getDoctorId(),
                    UserType.DOCTOR,
                    request.getPatientId(),
                    UserType.PATIENT,
                    EventType.MESSAGE_SENT_TO_PATIENT,
                    MessageSentToPatientEventMetadata.from(patient, request.getDoctorId()));

            log.info("Chat has been sent to patient by doctor:::::::::::::::::::::::::::::::" + messageResponse);
        }

        if (request.getRoleName().equalsIgnoreCase("patient")) {

            if (imageNames != null && imageNames.length > 0) {
                notificationProducer.sendPushNotification(PushNotificationEvent.builder()
                        .message(String.format("%s has added new files", patientForChatService.getFirstName()))
                        .mobile(doctorForChatService.getDoctorMobile())
                        .title("New files added")
                        .notificationIndex(94)
                        .isDoctorApp(true)
                        .patientId(patientForChatService.getPatientId())
                        .email(doctorForChatService.getEmail())
                        .build());
            } else {
                notificationProducer.sendPushNotification(PushNotificationEvent.builder()
                        .message(String.format("%s has sent you a message", patientForChatService.getFirstName()))
                        .mobile(doctorForChatService.getDoctorMobile())
                        .title("New message received")
                        .notificationIndex(14)
                        .isDoctorApp(true)
                        .patientId(patientForChatService.getPatientId())
                        .email(doctorForChatService.getEmail())
                        .build());
            }

            notificationProducer.sendWebNotification(WebNotificationEvent.builder()
                    .doctorId(request.getDoctorId())
                    .patientId(request.getPatientId())
                    .notificationBody(request.getPatientName() + " has sent you a message.")
                    .notificationTitle("Message Received")
                    .build());

            var patient = patientService.getPatientDetails(request.getPatientId());
            patientService.addEvent(
                    request.getPatientId(),
                    UserType.PATIENT,
                    request.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.MESSAGE_SENT_TO_DOCTOR,
                    MessageSentToDoctorEventMetadata.from(patient, request.getDoctorId()));

            String url = "/profile" + request.getPatientId() + "/chat";

            var orgName = patientService.isWhatsAppEnabledForOrg(request.getDoctorId());

            if (orgName != null) {
                whatsAppService.sendTemplateMessage(WhatsAppRequest.builder()
                        .campaignName(whatsappTemplateTypeProperties.getNEW_MESSAGE())
                        .destination(doctorForChatService.getDoctorMobile())
                        .templateParams(List.of(request.getPatientName(), url))
                        .userName("Ardentous Technologies Private Limited")
                        .source("new-landing-page form")
                        .orgName(OrgName.valueOf(orgName))
                        .build());
            }
        }
    }

    public ResponseEntity<String> sendNotification(String doctorName, PatientDetails patient, String messageType)
            throws IOException {
        Language language = patient.getLanguage();
        Locale locale = language.getLocale();

        String titleKey = "notification." + messageType + ".title";
        String messageKey = "notification." + messageType + ".message";

        String title = messageSource.getMessage(titleKey, null, locale);
        String message = messageSource.getMessage(messageKey, new Object[] {doctorName}, locale);

        return notificationService.sendNotification(
                message,
                patient.getMobile(),
                title,
                13,
                false,
                null,
                patient.getEmail(),
                null,
                null,
                null,
                null,
                null,
                null,
                null);
    }

    private UploadResult processAndUploadImages(AddChatRequest chatAddRequest, MultipartFile[] imageNames)
            throws JsonProcessingException {
        UploadFilesRequest uploadRequest = new UploadFilesRequest();
        uploadRequest.setParentPath("/Chat");
        UserId uploader = new UserId();

        if (chatAddRequest.getRoleName().equalsIgnoreCase("Doctor")) {
            uploader.setUserId(chatAddRequest.getDoctorId());
            uploader.setUserType(com.dentalstack.chat.dto.file.UserType.DOCTOR);
            uploadRequest.setUploader(uploader);
        } else {
            uploader.setUserId(chatAddRequest.getPatientId());
            uploader.setUserType(com.dentalstack.chat.dto.file.UserType.PATIENT);
            uploadRequest.setUploader(uploader);
        }

        Set<UserId> owners = new HashSet<>();
        owners.add(uploader);
        UserId patientOwner = new UserId();
        patientOwner.setUserId(chatAddRequest.getPatientId());
        patientOwner.setUserType(com.dentalstack.chat.dto.file.UserType.PATIENT);
        UserId doctorOwner = new UserId();
        doctorOwner.setUserId(chatAddRequest.getDoctorId());
        doctorOwner.setUserType(com.dentalstack.chat.dto.file.UserType.DOCTOR);
        owners.add(patientOwner);
        uploadRequest.setOwners(owners);
        ObjectMapper mapper = new ObjectMapper();

        String reqStr = mapper.writeValueAsString(uploadRequest);

        FileUploadDetails uploadDetails = patientServiceClient.uploadFiles(reqStr, imageNames);

        List<Long> fileIds = uploadDetails.getUploadFiles().stream()
                .map(FileDetails::getFileId)
                .toList();

        List<String> fileUrls = uploadDetails.getUploadFiles().stream()
                .map(FileDetails::getUrl)
                .filter(url -> url != null && !url.isEmpty())
                .toList();
        String imageUrls = String.join(",", fileUrls);

        return new UploadResult(imageUrls, fileIds);
    }

    private static class UploadResult {
        private final String imageUrls;
        private final List<Long> fileIds;

        public UploadResult(String imageUrls, List<Long> fileIds) {
            this.imageUrls = imageUrls;
            this.fileIds = fileIds;
        }

        public String getImageUrls() {
            return imageUrls;
        }

        public List<Long> getFileIds() {
            return fileIds;
        }
    }

    @Transactional(value = "transactionManager")
    public void removeFilesAndImages(RemoveFilesAndImagesRequest request) {
        // Find all chats that contain any of the file IDs
        List<Chat> chats =
                chatRepository.findChatsContainingAnyFileId(request.getFileIds().toArray(new Long[0]));

        for (Chat chat : chats) {
            if (chat.getFileIds() == null) {
                continue;
            }
            // Remove the file IDs from the chat
            List<Long> updatedFileIds = chat.getFileIds().stream()
                    .filter(fileId -> !request.getFileIds().contains(fileId))
                    .toList();
            chat.setFileIds(updatedFileIds);

            // Remove the corresponding image URLs
            if (chat.getImageName() != null && !chat.getImageName().isEmpty()) {
                List<String> imageUrls =
                        new ArrayList<>(List.of(chat.getImageName().split(",")));
                imageUrls.removeAll(request.getImageUrls());
                String updatedImageUrls = String.join(",", imageUrls);
                chat.setImageName(updatedImageUrls);
            }

            // Save the updated Chat entity
            chatRepository.save(chat);
        }
    }

    @Override
    public long getChatUnreadMessageCount(Long doctorId, List<Long> patientIds) {
        var superAdminDetails = patientService.getSuperAdminDetails(
                SuperAdminRequest.builder().doctorId(doctorId).build());
        if (superAdminDetails != null) {
            doctorId = superAdminDetails.getDoctorId();
        }
        return chatRepository.countByDoctorIdAndMessageReadFalseAndRoleNameAndPatientIds(doctorId, patientIds);
    }

    @Override
    @Transactional
    public void sendMultipleChat(AddMultipleChat request) throws IOException {

        var superAdminDetails = patientService.getSuperAdminDetails(
                SuperAdminRequest.builder().doctorId(request.getDoctorId()).build());
        if (superAdminDetails != null) {
            request.setDoctorId(superAdminDetails.getDoctorId());
        }
        List<Long> patientIds = new ArrayList<>();
        for (PatientChat patientChat : request.getPatients()) {
            DoctorPatientChat latestChatEntry =
                    doctorPatientChatRepository.findTopByPatientIdAndDoctorIdOrderByCreatedAtDesc(
                            patientChat.getPatientId(), request.getDoctorId());

            patientIds.add(patientChat.getPatientId());
            if (latestChatEntry == null) {
                // If no entry exists, create a new one
                DoctorPatientChat newEntry = new DoctorPatientChat();
                newEntry.setPatientId(patientChat.getPatientId());
                newEntry.setDoctorId(request.getDoctorId());
                newEntry.setIsAdded(true); // Set to true to indicate the patient is added to the chat
                doctorPatientChatRepository.save(newEntry);
            }

            Chat chat = new Chat();

            chat.setMessage(request.getMessage());
            chat.setPatientId(patientChat.getPatientId());
            chat.setDoctorId(request.getDoctorId());
            chat.setImageName("");
            chat.setCreatedBy(request.getCreatedBy());
            chat.setMessageRead(false);
            chat.setRoleName(request.getRoleName());
            chat.setActive(true);
            chatRepository.save(chat);

            // Notify via WebSocket with ChatResponse DTO
            ChatPatientResponse patientResponse = patientService.getPatientResponse(patientChat.getPatientId());
            Long alignerJourneyId = patientService.getAlignerJourneyIdOfPatient(patientChat.getPatientId());
            ChatResponse chatResponse = ChatResponse.from(chat, patientResponse, alignerJourneyId);
            messagingTemplate.convertAndSend("/topic/messages/" + patientChat.getPatientId(), chatResponse);

            if (request.getIsMessageSentFromPatientOverview() != null
                    && request.getIsMessageSentFromPatientOverview()) {
                patientService.addEvent(
                        patientChat.getPatientId(),
                        UserType.PATIENT,
                        request.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.REMINDER_SENT_TO_PATIENT,
                        ReminderSentToPatientEventMetadata.from(request.getDoctorId(), request.getAlignerSrNo()));
            }
        }
        List<PatientResponse> patientResponseList = patientService.getPatientResponseList(patientIds);
        DoctorForChatService doctorForChatService = doctorService.callGetDoctorForChat(
                request.getDoctorId(), request.getPatients().get(0).getPatientId());
        DoctorDetails doctorDetails = doctorService.getDoctor(request.getDoctorId());
        String doctorName = doctorDetails.isDrToDisplay()
                ? "Dr. " + doctorForChatService.getDoctorName()
                : doctorForChatService.getDoctorName();

        for (PatientResponse patientResponse : patientResponseList) {
            if (request.getRoleName().equalsIgnoreCase("Doctor")) {

                var patient = patientService.getPatientDetails(patientResponse.getPatientId());

                ResponseEntity<String> messageResponse = sendNotification(doctorName, patient, "message.received");

                log.info("Chat has been sent to patient by doctor:::::::::::::::::::::::::::::::" + messageResponse);
            }
        }
    }

    @Override
    @Transactional
    public void deleteChatByPatientId(Long patientId) {
        var chats = chatRepository.findByPatientId(patientId);
        if (!chats.isEmpty()) {
            chatRepository.deleteAllByPatientId(patientId);
        }
    }

    @Override
    public ChatAndUnreadMessageResponse getByChatDetailsByDoctorIdAndPatientId(
            Long doctorId, Long patientId, String roleName) {

        var superAdminDetails = patientService.getSuperAdminDetails(
                SuperAdminRequest.builder().doctorId(doctorId).build());
        if (superAdminDetails != null) {
            doctorId = superAdminDetails.getDoctorId();
        }
        List<ChatResponse> chatResponseReturn = new ArrayList<>();

        List<Chat> chatList = chatRepository.findByDoctorIdAndPatientIdAndActiveTrueOrderByIdAsc(doctorId, patientId);

        List<Chat> unreadMessageCount = null;

        if (roleName.equalsIgnoreCase("Patient")) {
            unreadMessageCount = chatRepository.findByDoctorIdAndPatientIdAndMessageReadFalseAndRoleName(
                    doctorId, patientId, "Doctor");
        }
        if (roleName.equalsIgnoreCase("doctor")) {
            unreadMessageCount = chatRepository.findByDoctorIdAndPatientIdAndMessageReadFalseAndRoleName(
                    doctorId, patientId, "Patient");
        }
        ChatPatientResponse patientResponse = patientService.getPatientResponse(patientId);

        List<Long> unreadMessageIdList = new ArrayList<>();
        for (Chat chat : unreadMessageCount) {
            unreadMessageIdList.add(chat.getId());
        }
        if (chatList != null && !chatList.isEmpty()) {
            ChatAndUnreadMessageResponse chatAndUnreadMessageResponse = new ChatAndUnreadMessageResponse();
            Long alignerJourneyId = patientService.getAlignerJourneyIdOfPatient(patientId);

            for (Chat chat : chatList) {

                ChatResponse chatResponse = ChatResponse.from(chat, patientResponse, alignerJourneyId);
                chatResponseReturn.add(chatResponse);
            }
            String fullName = patientResponse.getFirstName();
            if (patientResponse.getLastName() != null) {
                fullName += " " + patientResponse.getLastName();
            }
            chatAndUnreadMessageResponse.setChatResponseList(chatResponseReturn);
            chatAndUnreadMessageResponse.setUnreadMessageCount((long) unreadMessageCount.size());
            chatAndUnreadMessageResponse.setUnreadMessageIds(unreadMessageIdList);
            chatAndUnreadMessageResponse.setAlignerJourneyId(alignerJourneyId);
            chatAndUnreadMessageResponse.setFullName(fullName);
            chatAndUnreadMessageResponse.setPatientName(
                    patientResponse.getFirstName() + " " + patientResponse.getLastName());
            chatAndUnreadMessageResponse.setPatientProfile(patientResponse.getProfileImage());
            return chatAndUnreadMessageResponse;
        } else {

            String fullName = patientResponse.getFirstName();
            if (patientResponse.getLastName() != null) {
                fullName += " " + patientResponse.getLastName();
            }

            ChatAndUnreadMessageResponse chatAndUnreadMessageResponse = new ChatAndUnreadMessageResponse();
            chatAndUnreadMessageResponse.setFullName(fullName);

            chatAndUnreadMessageResponse.setPatientName(
                    patientResponse.getFirstName() + " " + patientResponse.getLastName());
            chatAndUnreadMessageResponse.setPatientProfile(patientResponse.getProfileImage());
            return chatAndUnreadMessageResponse;
        }
    }

    @Override
    @Transactional
    public void seenMessage(@Valid MessageSeenRequest messageSeen) {
        List<Chat> chatList = new ArrayList<>();
        for (Long chatId : messageSeen.getChatIdList()) {
            Optional<Chat> optional = chatRepository.findById(chatId);
            if (optional.isPresent()) {
                Chat chat = optional.get();
                if (chat.getRoleName().equals(messageSeen.getRoleName())) {
                    chat.setMessageRead(true);
                }
                chatList.add(chat);
            }
        }
        InactivateEventsRequest inactivateEventsRequest = new InactivateEventsRequest();
        inactivateEventsRequest.setEventIds(messageSeen.getEventIdList());
        patientService.inactivateEvents(inactivateEventsRequest);
        chatRepository.saveAll(chatList);
    }

    @Override
    @Transactional
    public void addPatientToChat(AddPatientToChatRequest request) {

        var superAdminDetails = patientService.getSuperAdminDetails(SuperAdminRequest.builder()
                .doctorId(request.getDoctorId())
                .profileId(request.getProfileId())
                .build());
        if (superAdminDetails != null) {
            request.setDoctorId(superAdminDetails.getDoctorId());
            request.setProfileId(superAdminDetails.getProfileId());
        }
        Long doctorId = request.getDoctorId();
        List<Long> patientIds = request.getPatientId();

        // Iterate through the list of patient IDs
        for (Long patientId : patientIds) {
            // Check if an entry already exists for this patient and doctor
            DoctorPatientChat latestChatEntry =
                    doctorPatientChatRepository.findTopByPatientIdAndDoctorIdOrderByCreatedAtDesc(patientId, doctorId);

            if (latestChatEntry == null) {
                // If no entry exists, create a new one
                DoctorPatientChat newEntry = new DoctorPatientChat();
                newEntry.setPatientId(patientId);
                newEntry.setDoctorId(doctorId);
                newEntry.setIsAdded(true); // Set to true to indicate the patient is added to the chat
                doctorPatientChatRepository.save(newEntry);
            } else {
                // Entry already exists, update it
                latestChatEntry.setIsAdded(true); // Update to true if not already set
                doctorPatientChatRepository.save(latestChatEntry);
            }
        }
    }

    @Override
    public List<ChatImageUrlOfPatient> getChatGalleryImages(Long patientId) {
        List<Chat> patientChats = chatRepository.findByPatientId(patientId);

        if (patientChats.isEmpty()) {
            throw new InvalidRequestException(ErrorCode.BAD_REQUEST, "No chat found for this patient id " + patientId);
        }
        Long alignerJourneyId = patientService.getAlignerJourneyIdOfPatient(patientId);
        // Map Chat entities to ChatImageUrlOfPatient objects
        return patientChats.stream()
                .filter(chat ->
                        chat.getImageName() != null && !chat.getImageName().isEmpty())
                .map(chat -> {
                    String[] imageNames = chat.getImageName().split(Pattern.quote(","));
                    return new ChatImageUrlOfPatient(
                            chat.getPatientId(), imageNames, chat.getCreatedAt(), alignerJourneyId);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ChatMessageResponse> getByChatDetailsByDoctorId(Long doctorId, Long organizationId, Long profileId) {
        var superAdminDetails = patientService.getSuperAdminDetails(SuperAdminRequest.builder()
                .doctorId(doctorId)
                .profileId(profileId)
                .build());
        if (superAdminDetails != null) {
            doctorId = superAdminDetails.getDoctorId();
            organizationId = superAdminDetails.getOrganizationId();
            profileId = superAdminDetails.getProfileId();
        }

        List<PatientResponse> patientResponses =
                patientService.getPatientDetailsForChatDashboard(doctorId, organizationId, profileId);

        if (patientResponses.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> patientIds =
                patientResponses.stream().map(PatientResponse::getPatientId).collect(Collectors.toList());

        Set<Long> validPatientIds =
                doctorPatientChatRepository.findAllByDoctorIdAndPatientIdsAndIsAddedTrue(doctorId, patientIds).stream()
                        .map(DoctorPatientChat::getPatientId)
                        .collect(Collectors.toSet());

        Map<Long, ChatSummaryDetail> chatSummaries =
                chatRepository.findAllChatSummariesByDoctorAndPatients(doctorId, patientIds).stream()
                        .collect(Collectors.toMap(ChatSummaryDetail::getPatientId, Function.identity()));

        Map<Long, PatientResponse> patientMap =
                patientResponses.stream().collect(Collectors.toMap(PatientResponse::getPatientId, Function.identity()));

        Long finalDoctorId = doctorId;
        return validPatientIds.stream()
                .map(patientId -> createChatMessageResponse(
                        patientId, finalDoctorId, patientMap.get(patientId), chatSummaries.get(patientId)))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(
                        ChatMessageResponse::getCreatedDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private ChatMessageResponse createChatMessageResponse(
            Long patientId, Long doctorId, PatientResponse patient, ChatSummaryDetail chatSummary) {

        if (patient == null) {
            return null;
        }

        ChatMessageResponse chatResponse = new ChatMessageResponse();

        if (chatSummary != null) {
            chatResponse.setMessage(chatSummary.getMessage());
            chatResponse.setImageName(chatSummary.getImageName().split(java.util.regex.Pattern.quote(",")));
            chatResponse.setDoctorId(chatSummary.getDoctorId());
            chatResponse.setPatientId(chatSummary.getPatientId());
            chatResponse.setChatId(chatSummary.getId());
            chatResponse.setCreatedBy(chatSummary.getCreatedBy());
            chatResponse.setCreatedDate(chatSummary.getCreatedAt());
            chatResponse.setRoleName(chatSummary.getRoleName());
            chatResponse.setUnreadMessage(chatSummary.getUnreadCount().intValue());

            if (chatSummary.getLastUnreadId() != null) {
                chatResponse.setUnreadMessageChatId(chatSummary.getLastUnreadId());
            }
        }

        // Set patient details
        chatResponse.setUserId(patient.getPatientId());
        chatResponse.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        chatResponse.setProfileImage(patient.getProfileImage());
        chatResponse.setProfileImageId(patient.getProfileImageId());
        chatResponse.setFullName(patient.getPatientFullName());
        chatResponse.setAlignerJourneyId(patient.getAlignerJourneyId());

        return chatResponse;
    }

    @Override
    public List<ChatResponse> getByPatientId(Long patientId) {

        List<ChatResponse> chatResponseReturn = new ArrayList<>();

        List<Chat> chatList = chatRepository.findByPatientIdAndActiveTrue(patientId);

        // Fetch patient response once outside the loop (fixes N+1 query)
        ChatPatientResponse patientResponse = patientService.getPatientResponse(patientId);
        Long alignerJourneyId = patientService.getAlignerJourneyIdOfPatient(patientId);

        for (Chat chat : chatList) {
            ChatResponse chatResponse = ChatResponse.from(chat, patientResponse, alignerJourneyId);
            chatResponseReturn.add(chatResponse);
        }
        return chatResponseReturn;
    }

    private ChatMessageResponse createChatMessageResponse(
            Long patientId, Long doctorId, List<PatientResponse> patientList, Long alignerJourneyId) {
        ChatMessageResponse chatResponse = new ChatMessageResponse();

        // Fetch only required chat summary fields
        ChatSummary chatSummary =
                chatRepository.findChatSummary(doctorId, patientId).orElse(null);

        if (chatSummary != null) {
            chatResponse.setMessage(chatSummary.getMessage());
            String[] arrOfStr = chatSummary.getImageName().split(java.util.regex.Pattern.quote(","));
            chatResponse.setImageName(arrOfStr);
            chatResponse.setDoctorId(chatSummary.getDoctorId());
            chatResponse.setPatientId(chatSummary.getPatientId());
            chatResponse.setChatId(chatSummary.getId());
            chatResponse.setCreatedBy(chatSummary.getCreatedBy());
            chatResponse.setCreatedDate(chatSummary.getCreatedAt());
            chatResponse.setAlignerJourneyId(alignerJourneyId);
            chatResponse.setRoleName(chatSummary.getRoleName());
        }

        long unreadCount = chatRepository.countUnreadMessages(doctorId, patientId, "Patient");
        chatResponse.setUnreadMessage((int) unreadCount);

        if (unreadCount > 0) {
            chatRepository
                    .findLatestUnreadMessageId(doctorId, patientId, "Patient")
                    .ifPresent(chatResponse::setUnreadMessageChatId);
        }

        PatientResponse matchingPatient = findPatientById(patientList, patientId);
        if (matchingPatient != null) {
            chatResponse.setUserId(matchingPatient.getPatientId());
            chatResponse.setPatientName(matchingPatient.getFirstName() + " " + matchingPatient.getLastName());
            chatResponse.setProfileImage(matchingPatient.getProfileImage());
            chatResponse.setFullName(matchingPatient.getPatientFullName());
        } else {
            chatResponse.setPatientName("");
            chatResponse.setProfileImage("");
        }

        return chatResponse;
    }

    private PatientResponse findPatientById(List<PatientResponse> patientList, Long patientId) {
        for (PatientResponse patient : patientList) {
            if (patient.getPatientId().equals(patientId)) {
                return patient;
            }
        }
        return null;
    }

    public LatestUnreadMessageResponse getLatestUnreadMessageForPatient(Long patientId) {
        Optional<Chat> latestUnreadChatOpt =
                chatRepository.findFirstByPatientIdAndMessageReadFalseAndRoleNameAndActiveTrueOrderByCreatedAtDesc(
                        patientId, "Doctor");

        if (latestUnreadChatOpt.isEmpty()) {
            return null;
        }

        Chat latestUnreadChat = latestUnreadChatOpt.get();
        DoctorForChatService doctorResponse =
                doctorService.callGetDoctorForChat(latestUnreadChat.getDoctorId(), patientId);

        ZoneId desiredTimeZone = ZoneId.of("Asia/Kolkata");
        ZonedDateTime zonedDateTime = latestUnreadChat.getCreatedAt().atZone(desiredTimeZone);

        return LatestUnreadMessageResponse.builder()
                .chatId(latestUnreadChat.getId())
                .patientId(latestUnreadChat.getPatientId())
                .doctorId(latestUnreadChat.getDoctorId())
                .message(latestUnreadChat.getMessage())
                .imageName(
                        latestUnreadChat.getImageName() != null
                                ? latestUnreadChat.getImageName().split(Pattern.quote(","))
                                : new String[0])
                .doctorName(doctorResponse != null ? doctorResponse.getDoctorName() : null)
                .doctorProfile(doctorResponse != null ? doctorResponse.getDoctorProfile() : null)
                .doctorProfileId(doctorResponse != null ? doctorResponse.getDoctorProfileId() : null)
                .createdDate(zonedDateTime.toLocalDateTime())
                .showPopup(true)
                .build();
    }

    public void dismissChatPopup(Long chatId, Long patientId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!chat.getPatientId().equals(patientId)) {
            throw new RuntimeException("Unauthorized: Chat does not belong to this patient");
        }

        chat.setPopupDismissed(true);
        chatRepository.save(chat);
    }
}
