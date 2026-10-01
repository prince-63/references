package com.dentalstack.patient.feature.chat.service.impl;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.chat.dto.request.GetMessagesByChatRequest;
import com.dentalstack.patient.feature.chat.dto.request.SendMessageRequest;
import com.dentalstack.patient.feature.chat.dto.response.*;
import com.dentalstack.patient.feature.chat.entity.*;
import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.dentalstack.patient.feature.chat.repository.ChatMessageRepository;
import com.dentalstack.patient.feature.chat.repository.ChatParticipantRepository;
import com.dentalstack.patient.feature.chat.repository.DoctorChatRepository;
import com.dentalstack.patient.feature.chat.repository.MessageReadReceiptRepository;
import com.dentalstack.patient.feature.chat.service.ChatMessageService;
import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketMessageEvent;
import com.dentalstack.patient.feature.chat.websocket.relay.ChatBroadcastPayload;
import com.dentalstack.patient.feature.chat.websocket.relay.ChatBroadcastRedisPublisher;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.vsp.VspNewMessageEmailRequest;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.PlanningNotificationService;
import com.dentalstack.patient.feature.notification.service.VspPlanningEmailService;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerNewMessageMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspNewMessageCustomerToLabEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspNewMessageLabToCustomerEventMetadata;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.dto.summary.VspOrderIdAndStatus;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.vsp.util.VspPortUrlResolver;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.event.TimelineEvent;
import com.dentalstack.patient.global.exception.GenericException;
import com.dentalstack.patient.global.utils.StringUtil;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageServiceImpl implements ChatMessageService {

    private final ChatMessageRepository messageRepository;
    private final DoctorChatRepository chatRepository;
    private final ChatParticipantRepository participantRepository;
    private final UserProfileRepository userProfileRepository;
    private final FilesService filesService;
    private final OrderRepository orderRepository;
    private final ChatBroadcastRedisPublisher broadcastPublisher;
    private final MessageReadReceiptRepository readReceiptRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final ChatService chatService;
    private final VspOrderRepository vspOrderRepository;
    private final VspPlanningEmailService vspPlanningEmailService;
    private final PlanningNotificationService planningNotificationService;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final XOrganizationNameResolver xOrgNameResolver;
    private final WhatsAppUtilities whatsAppUtilities;

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, MultipartFile[] files) {
        log.info("Sending message to chat: {}", request.getChatId());

        DoctorChat chat =
                chatRepository.findById(request.getChatId()).orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, request.getProfileId());

        UserProfile sender = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new GenericException("User profile not found"));

        ChatMessage replyToMessage = null;
        if (request.getReplyToMessageId() != null) {
            replyToMessage = messageRepository
                    .findById(request.getReplyToMessageId())
                    .orElseThrow(() -> new GenericException("Reply-to message not found"));
        }

        ChatMessage message = ChatMessage.builder()
                .chat(chat)
                .senderProfile(sender)
                .messageType(request.getMessageType())
                .textContent(request.getTextContent())
                .replyToMessage(replyToMessage)
                .isDeleted(false)
                .isEdited(false)
                .senderName(sender.getUser().fullNameWithSalutation())
                .senderOrganization(sender.getOrganizationBrandName())
                .build();

        message = messageRepository.save(message);

        if (files != null && files.length > 0) {
            addFiles(files, request, message, chat.getPatient().getId());
        }

        chat.setLastMessageAt(message.getCreatedAt());
        chatRepository.save(chat);

        updateUnreadCounts(chat.getId(), request.getProfileId());

        MessageResponse response = buildMessageResponse(message);

        WebSocketMessageEvent baseEvent = WebSocketMessageEvent.builder()
                .eventType("NEW_MESSAGE")
                .chatId(chat.getId())
                .messageId(message.getId())
                .senderId(sender.getId())
                .senderName(message.getSenderName())
                .senderEmail(sender.getUser() != null ? sender.getUser().getEmail() : null)
                .senderOrganization(message.getSenderOrganization())
                .messageType(message.getMessageType())
                .textContent(message.getTextContent())
                .timestamp(message.getCreatedAt())
                .replyToMessageId(replyToMessage != null ? replyToMessage.getId() : null)
                .hasReply(replyToMessage != null)
                .attachmentCount(message.getFiles().size())
                .attachments(message.getFiles().stream().map(FileDetails::from).toList())
                .alignerCheckIn(
                        message.getMessageType() == MessageType.ALIGNER_CHECK_IN && message.getAlignerCheckIn() != null
                                ? buildAlignerCheckInResponse(message.getAlignerCheckIn())
                                : null)
                .isDeleted(false)
                .build();

        broadcastMessageEventToParticipants(chat, baseEvent, sender);

        try {
            if (serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
                PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                        chat.getPatient().getId());
                Optional<VspOrderIdAndStatus> vspOrder =
                        vspOrderRepository.findLatestActiveVspOrderByPatientExcludingDraft(
                                chat.getPatient().getId());
                AtomicReference<VspOrderStatus> caseStatus = new AtomicReference<>();
                vspOrder.ifPresent(d -> {
                    caseStatus.set(d.getStatus());
                });
                if (pdo.getUserProfile().getId().equals(request.getProfileId())) {
                    String practiceName = pdo.getUserProfile().getPracticeName();
                    String labName = pdo.getAddedByUserProfile().getLabName();
                    eventPublisher.publishEvent(TimelineEvent.builder(this)
                            .userId(pdo.getPatient().getId())
                            .userType(UserType.PATIENT)
                            .forUserId(pdo.getAddedByUserProfile().getDoctor().getId())
                            .forUserType(UserType.DOCTOR)
                            .eventType(EventType.VSP_NEW_MESSAGE_CUSTOMER_TO_LAB)
                            .metadata(new VspNewMessageCustomerToLabEventMetadata(
                                    pdo.getPatient().getId(),
                                    pdo.getPatient().fullName(),
                                    pdo.getUserProfile().getUser().displayName(),
                                    labName,
                                    practiceName))
                            .orgUserProfile(pdo.getAddedByUserProfile())
                            .organization(pdo.getAddedByUserProfile().getOrganization())
                            .build());

                    VspNewMessageEmailRequest labEmailRequest = VspNewMessageEmailRequest.builder()
                            .messageSender(pdo.getUserProfile().getUser().displayName())
                            .userEmailId(pdo.getAddedByUserProfile().getUser().getEmail())
                            .patientName(pdo.getPatient().fullName())
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .email(pdo.getOrgUserProfile().getUser().getEmail())
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .caseStatus(StringUtil.toReadable(caseStatus.get().name()))
                            .build();
                    vspPlanningEmailService.sendVspNewMessageEmail(labEmailRequest);
                } else {
                    String practiceName = pdo.getUserProfile().getPracticeName();
                    String labName = pdo.getOrgUserProfile().getLabName();
                    eventPublisher.publishEvent(TimelineEvent.builder(this)
                            .userId(pdo.getPatient().getId())
                            .userType(UserType.PATIENT)
                            .forUserId(pdo.getUserProfile().getDoctor().getId())
                            .forUserType(UserType.DOCTOR)
                            .eventType(EventType.VSP_NEW_MESSAGE_LAB_TO_CUSTOMER)
                            .metadata(new VspNewMessageLabToCustomerEventMetadata(
                                    pdo.getPatient().getId(),
                                    pdo.getPatient().fullName(),
                                    pdo.getOrgUserProfile().getUser().getDisplayName(),
                                    labName,
                                    practiceName))
                            .build());
                    VspNewMessageEmailRequest customerEmailRequest = VspNewMessageEmailRequest.builder()
                            .messageSender(pdo.getOrgUserProfile().getUser().displayName())
                            .userEmailId(pdo.getUserProfile().getUser().getEmail())
                            .patientName(pdo.getPatient().fullName())
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .email(pdo.getUserProfile().getUser().getEmail())
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .caseStatus(StringUtil.toReadable(caseStatus.get().name()))
                            .build();
                    vspPlanningEmailService.sendVspNewMessageEmail(customerEmailRequest);
                }
            }
            if (sender.isEnterpriseOrDesignLab()
                    && serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
                Patient patient = chat.getPatient();
                PatientDoctorOrganization patientDoctorOrganization =
                        patientDoctorOrganizationRepository.findByPatient(patient.getId());

                eventPublisher.publishEvent(TimelineEvent.builder(this)
                        .userId(patient.getId())
                        .userType(UserType.PATIENT)
                        .forUserId(patientDoctorOrganization
                                .getUserProfile()
                                .getDoctor()
                                .getId())
                        .forUserType(UserType.DOCTOR)
                        .eventType(EventType.NEW_MESSAGE)
                        .metadata(new PlanningCustomerNewMessageMetadata(
                                patient.getId(),
                                patient.fullName(),
                                sender.getUser().getDisplayName()))
                        .build());

                String title = "New Message";
                String description = String.format(
                        "%s has sent you a message.", sender.getUser().getDisplayName());
                try {
                    chatService.sendNotification(SendNotificationRequest.builder()
                            .patientId(patient.getId())
                            .title(title)
                            .message(description)
                            .notificationIndex(163)
                            .mobile(patientDoctorOrganization
                                    .getUserProfile()
                                    .getUser()
                                    .getMobileNo())
                            .email(patientDoctorOrganization
                                    .getUserProfile()
                                    .getUser()
                                    .getEmail())
                            .isDoctorApp(true)
                            .globalId(patient.getId().toString())
                            .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                            .xOrgName(xOrgNameResolver
                                    .resolveFromPatientId(patient.getId())
                                    .getXOrgName())
                            .organizationId(xOrgNameResolver
                                    .resolveFromPatientId(patient.getId())
                                    .getOrganizationId())
                            .build());

                    whatsAppUtilities
                            .resolveMobileNumberOfSpecificUser(patient.getId(), List.of(MessageSendTo.CUSTOMER))
                            .forEach(mobileNo -> {
                                String url = "lab-chat";
                                planningNotificationService.sendWhatsAppSafely(
                                        patientDoctorOrganization.getUserProfile(),
                                        mobileNo,
                                        whatsappTemplateTypeProperties.getPLANNING_NEW_MESSAGE_RECEIVED(),
                                        List.of(sender.getUser().displayName(), url));
                            });
                } catch (Exception e) {
                    log.error("Failed to send new message notification for chat service. Error: {}", e.getMessage());
                }
            } else if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
                Patient patient = chat.getPatient();
                PatientDoctorOrganization patientDoctorOrganization =
                        patientDoctorOrganizationRepository.findByPatient(patient.getId());
                Optional<UserProfile> labProfile =
                        userProfileRepository.findByIdWithOrgAndDoctor(patientDoctorOrganization
                                .getUserProfile()
                                .getInviterProfile()
                                .getId());
                labProfile.ifPresent(f -> {
                    eventPublisher.publishEvent(TimelineEvent.builder(this)
                            .userId(patient.getId())
                            .userType(UserType.PATIENT)
                            .forUserId(f.getDoctor().getId())
                            .forUserType(UserType.DOCTOR)
                            .eventType(EventType.NEW_MESSAGE)
                            .metadata(new PlanningCustomerNewMessageMetadata(
                                    patient.getId(),
                                    patient.fullName(),
                                    sender.getUser().getDisplayName()))
                            .orgUserProfile(f)
                            .organization(f.getOrganization())
                            .build());

                    String title = "New Message";
                    String description = String.format(
                            "%s has sent you a message.", sender.getUser().getDisplayName());
                    try {
                        chatService.sendNotification(SendNotificationRequest.builder()
                                .patientId(patient.getId())
                                .title(title)
                                .message(description)
                                .notificationIndex(163)
                                .mobile(f.getUser().getMobileNo())
                                .email(f.getUser().getEmail())
                                .xOrgName(xOrgNameResolver
                                        .resolveFromPatientId(patient.getId())
                                        .getXOrgName())
                                .organizationId(xOrgNameResolver
                                        .resolveFromPatientId(patient.getId())
                                        .getOrganizationId())
                                .isDoctorApp(true)
                                .globalId(patient.getId().toString())
                                .serviceName(
                                        patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                                .build());
                    } catch (Exception e) {
                        log.error("Failed to send new message notification for lab profile. Error: {}", e.getMessage());
                    }

                    whatsAppUtilities
                            .resolveMobileNumberOfSpecificUser(
                                    patient.getId(), List.of(MessageSendTo.ADMIN, MessageSendTo.SUPER_ADMIN))
                            .forEach(mobileNo -> {
                                String url = "lab-chat";
                                planningNotificationService.sendWhatsAppSafely(
                                        patientDoctorOrganization.getUserProfile(),
                                        mobileNo,
                                        whatsappTemplateTypeProperties.getPLANNING_NEW_MESSAGE_RECEIVED(),
                                        List.of(sender.getUser().getDisplayName(), url));
                            });
                });
            }
        } catch (Exception e) {
            log.info("");
        }

        log.info("[CHAT-BROADCAST] Message sent successfully: messageId={}, chatId={}", message.getId(), chat.getId());
        return response;
    }

    private void addFiles(MultipartFile[] files, SendMessageRequest request, ChatMessage message, Long patientId) {

        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientIdUser =
                UserId.builder().userId(patientId).userType(UserType.PATIENT).build();

        UploadFilesRequest uploadRequest = new UploadFilesRequest("/Chat", doctorId, Set.of(doctorId, patientIdUser));
        var uploadDetails = filesService.uploadFilesToS3Only(uploadRequest, files, false);
        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn(
                    "Failed to upload some files for message {}: {}",
                    message.getId(),
                    uploadDetails.getFailedToUpload());
        }

        Set<File> existingFiles = new HashSet<>(message.getFiles());
        Set<File> newFiles = new HashSet<>(uploadDetails.getUploadFiles());
        newFiles.removeAll(existingFiles);

        if (!newFiles.isEmpty()) {
            message.getFiles().addAll(newFiles);
            messageRepository.save(message);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MessageResponse getMessage(Long messageId, Long currentUserProfileId) {
        ChatMessage message = messageRepository
                .findByIdWithAllRelations(messageId)
                .orElseThrow(() -> new GenericException("Message not found"));

        validateUserAccess(message.getChat(), currentUserProfileId);

        return buildMessageResponse(message);
    }

    private void markMessagesAsRead(
            List<ChatMessage> messages, Long readerProfileId, UserProfile readerProfile, Long chatId) {

        if (messages.isEmpty()) return;

        Set<Long> messageIds = messages.stream()
                .filter(m -> !m.getSenderProfile().getId().equals(readerProfileId))
                .filter(m -> !m.getIsDeleted())
                .map(ChatMessage::getId)
                .collect(Collectors.toSet());

        if (messageIds.isEmpty()) return;

        Set<Long> alreadyReadIds = readReceiptRepository.findReadMessageIdsByUserProfileId(messageIds, readerProfileId);

        List<MessageReadReceipt> newReceipts = messages.stream()
                .filter(m -> messageIds.contains(m.getId()) && !alreadyReadIds.contains(m.getId()))
                .map(m -> MessageReadReceipt.builder()
                        .message(m)
                        .userProfile(readerProfile)
                        .readAt(ZonedDateTime.now())
                        .build())
                .collect(Collectors.toList());

        if (!newReceipts.isEmpty()) {
            readReceiptRepository.saveAll(newReceipts);
            log.info(
                    "[READ-RECEIPT] Marked {} messages as read for profileId={} in chatId={}",
                    newReceipts.size(),
                    readerProfileId,
                    chatId);

            broadcastReadReceiptEvent(chatId, readerProfileId, readerProfile, messageIds);
        }

        participantRepository.markAsRead(chatId, readerProfileId, ZonedDateTime.now());
    }

    private void broadcastReadReceiptEvent(
            Long chatId, Long readerProfileId, UserProfile readerProfile, Set<Long> readMessageIds) {

        DoctorChat chat = chatRepository.findById(chatId).orElseThrow(() -> new GenericException("Chat not found"));

        WebSocketMessageEvent event = WebSocketMessageEvent.builder()
                .eventType("MESSAGES_READ")
                .chatId(chatId)
                .senderId(readerProfileId)
                .senderEmail(
                        readerProfile.getUser() != null
                                ? readerProfile.getUser().getEmail()
                                : null)
                .readMessageIds(new ArrayList<>(readMessageIds))
                .timestamp(ZonedDateTime.now())
                .build();

        broadcastMessageEventToParticipants(chat, event, readerProfile);

        log.info(
                "[READ-RECEIPT] Broadcasted MESSAGES_READ event for chatId={}, readerProfileId={}, messageCount={}",
                chatId,
                readerProfileId,
                readMessageIds.size());
    }

    @Override
    @Transactional
    public MessageListResponse getMessagesByChat(GetMessagesByChatRequest request) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        DoctorChat chat =
                chatRepository.findById(request.getChatId()).orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, request.getProfileId());

        UserProfile ownerUserProfile = null;
        if (serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
            if (userProfile.isPractice()) {
                var patientId = chat.getPatient().getId();
                ownerUserProfile = vspOrderRepository
                        .findLatestTargetProfileByPatientIdAndOwnerProfileId(patientId, request.getProfileId())
                        .orElseThrow(() -> new GenericException("No doctor assigned to this patient"));
            }
        } else {
            if (userProfile.isPractice()) {
                var patientId = chat.getPatient().getId();
                ownerUserProfile = orderRepository
                        .findLatestTargetProfileByPatientIdAndOwnerProfileId(patientId, request.getProfileId())
                        .orElseThrow(() -> new GenericException("No doctor assigned to this patient"));
            }
        }

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Long> messageIdsPage = messageRepository.findMessageIdsByChatId(request.getChatId(), pageable);

        List<ChatMessage> messages = messageIdsPage.getContent().isEmpty()
                ? List.of()
                : messageRepository.findAllByIdsWithRelations(messageIdsPage.getContent());

        Page<ChatMessage> messagesPage = new PageImpl<>(messages, pageable, messageIdsPage.getTotalElements());

        markMessagesAsRead(messagesPage.getContent(), request.getProfileId(), userProfile, chat.getId());

        final UserProfile finalOwnerProfile = ownerUserProfile;
        final Long requestingProfileId = request.getProfileId();

        List<MessageResponse> messageResponses = messagesPage.getContent().stream()
                .map(message -> buildMessageResponse(message, requestingProfileId, finalOwnerProfile))
                .collect(Collectors.toList());

        return MessageListResponse.builder()
                .messages(messageResponses)
                .paginationDetails(buildPaginationDetails(messagesPage))
                .build();
    }

    @Override
    @Transactional
    public MessageListResponse getVspMessagesByChat(GetMessagesByChatRequest request) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        DoctorChat chat =
                chatRepository.findById(request.getChatId()).orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, request.getProfileId());

        UserProfile ownerUserProfile = null;
        if (userProfile.isPractice()) {
            var patientId = chat.getPatient().getId();
            ownerUserProfile = vspOrderRepository
                    .findLatestAssignedToUserProfileByPatientIdAndCreatedByProfileId(
                            patientId, request.getProfileId(), PageRequest.of(0, 1))
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new GenericException("No doctor assigned to this patient"));
        }

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Long> messageIdsPage = messageRepository.findMessageIdsByChatId(request.getChatId(), pageable);

        List<ChatMessage> messages = messageIdsPage.getContent().isEmpty()
                ? List.of()
                : messageRepository.findAllByIdsWithRelations(messageIdsPage.getContent());

        Page<ChatMessage> messagesPage = new PageImpl<>(messages, pageable, messageIdsPage.getTotalElements());

        markMessagesAsRead(messagesPage.getContent(), request.getProfileId(), userProfile, chat.getId());

        final UserProfile finalOwnerProfile = ownerUserProfile;
        final Long requestingProfileId = request.getProfileId();

        List<MessageResponse> messageResponses = messagesPage.getContent().stream()
                .map(message -> buildMessageResponse(message, requestingProfileId, finalOwnerProfile))
                .collect(Collectors.toList());

        return MessageListResponse.builder()
                .messages(messageResponses)
                .paginationDetails(buildPaginationDetails(messagesPage))
                .build();
    }

    private List<MessageReadReceiptResponse> buildReadReceiptResponses(ChatMessage message) {

        if (message.getReadReceipts() == null || message.getReadReceipts().isEmpty()) {
            return List.of();
        }

        return message.getReadReceipts().stream()
                .map(receipt -> MessageReadReceiptResponse.builder()
                        .id(receipt.getId())
                        .userProfileId(receipt.getUserProfile().getId())
                        .userName(
                                receipt.getUserProfile().getUser() != null
                                        ? receipt.getUserProfile().getUser().fullNameWithSalutation()
                                        : null)
                        .readAt(receipt.getReadAt().toLocalDateTime())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MessageListResponse getMessagesBeforeTimestamp(
            Long chatId, ZonedDateTime beforeTimestamp, Long currentUserProfileId, Pageable pageable) {

        DoctorChat chat = chatRepository.findById(chatId).orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, currentUserProfileId);

        Page<ChatMessage> messagesPage =
                messageRepository.findByChatIdBeforeTimestamp(chatId, beforeTimestamp, pageable);

        List<MessageResponse> messageResponses = messagesPage.getContent().stream()
                .map(this::buildMessageResponse)
                .collect(Collectors.toList());

        return MessageListResponse.builder()
                .messages(messageResponses)
                .paginationDetails(buildPaginationDetails(messagesPage))
                .build();
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long currentUserProfileId) {
        ChatMessage message = messageRepository
                .findByIdWithAllRelations(messageId)
                .orElseThrow(() -> new GenericException("Message not found"));

        validateUserAccess(message.getChat(), currentUserProfileId);

        if (!message.getSenderProfile().getId().equals(currentUserProfileId)) {
            throw new GenericException("Only message sender can delete the message");
        }

        message.setIsDeleted(true);
        message.setDeletedAt(ZonedDateTime.now());
        message.setDeletedBy(message.getSenderProfile());
        messageRepository.save(message);

        log.info("Message {} deleted by user {}", messageId, currentUserProfileId);

        WebSocketMessageEvent event = WebSocketMessageEvent.builder()
                .eventType("MESSAGE_DELETED")
                .chatId(message.getChat().getId())
                .messageId(message.getId())
                .senderId(message.getSenderProfile().getId())
                .senderEmail(
                        message.getSenderProfile().getUser() != null
                                ? message.getSenderProfile().getUser().getEmail()
                                : null)
                .isDeleted(true)
                .timestamp(message.getCreatedAt())
                .build();

        broadcastMessageEventToParticipants(message.getChat(), event, message.getSenderProfile());
    }

    @Override
    @Transactional
    public MessageResponse editMessage(Long messageId, String newContent, Long currentUserProfileId) {
        ChatMessage message = messageRepository
                .findByIdWithAllRelations(messageId)
                .orElseThrow(() -> new GenericException("Message not found"));

        validateUserAccess(message.getChat(), currentUserProfileId);

        if (!message.getSenderProfile().getId().equals(currentUserProfileId)) {
            throw new GenericException("Only message sender can edit the message");
        }

        message.setTextContent(newContent);
        message.setIsEdited(true);
        message.setEditedAt(ZonedDateTime.now());
        messageRepository.save(message);

        log.info("Message {} edited by user {}", messageId, currentUserProfileId);

        WebSocketMessageEvent event = WebSocketMessageEvent.builder()
                .eventType("MESSAGE_EDITED")
                .chatId(message.getChat().getId())
                .messageId(message.getId())
                .senderId(message.getSenderProfile().getId())
                .senderEmail(
                        message.getSenderProfile().getUser() != null
                                ? message.getSenderProfile().getUser().getEmail()
                                : null)
                .textContent(message.getTextContent())
                .editedContent(message.getTextContent())
                .attachments(message.getFiles().stream().map(FileDetails::from).toList())
                .timestamp(message.getCreatedAt())
                .editedAt(message.getEditedAt())
                .build();

        broadcastMessageEventToParticipants(message.getChat(), event, message.getSenderProfile());

        return buildMessageResponse(message);
    }

    private void validateUserAccess(DoctorChat chat, Long userProfileId) {
        if (participantRepository.existsByChatIdAndUserProfileIdAndIsActiveTrue(chat.getId(), userProfileId)) {
            return;
        }

        if (participantRepository.existsParticipantWithInviterProfileId(chat.getId(), userProfileId)) {

            var existing = participantRepository.findByChatIdAndUserProfileId(chat.getId(), userProfileId);
            if (existing.isPresent()) {
                ChatParticipant participant = existing.get();
                participant.setIsActive(true);
                participant.setJoinedAt(java.time.ZonedDateTime.now());
                participant.setUnreadCount(0);
                participantRepository.save(participant);
                log.info("Reactivated owner profileId={} as participant in chatId={}", userProfileId, chat.getId());
            } else {
                UserProfile ownerProfile = userProfileRepository
                        .findById(userProfileId)
                        .orElseThrow(() -> new GenericException("User profile not found"));

                ChatParticipant participant = ChatParticipant.builder()
                        .chat(chat)
                        .userProfile(ownerProfile)
                        .joinedAt(java.time.ZonedDateTime.now())
                        .isActive(true)
                        .isOnline(false)
                        .isTyping(false)
                        .unreadCount(0)
                        .build();
                participantRepository.save(participant);
                log.info("Auto-added owner profileId={} as participant to chatId={}", userProfileId, chat.getId());
            }
            return;
        }

        throw new GenericException("Access denied to this chat");
    }

    private void updateUnreadCounts(Long chatId, Long senderProfileId) {
        List<ChatParticipant> participants = participantRepository.findByChatIdAndIsActiveTrue(chatId);

        for (ChatParticipant participant : participants) {
            if (!participant.getUserProfile().getId().equals(senderProfileId)) {
                participant.setUnreadCount(participant.getUnreadCount() + 1);
                participantRepository.save(participant);
            }
        }
    }

    @Override
    @Transactional
    public void broadcastMessageEventToParticipants(
            DoctorChat chat, WebSocketMessageEvent baseEvent, UserProfile sender) {
        Long chatId = chat.getId();
        Long senderId = sender.getId();
        Long patientId = chat.getPatient() != null ? chat.getPatient().getId() : null;

        log.info(
                "[CHAT-BROADCAST] Preparing broadcast for chatId={}, senderId={}, eventType={}",
                chatId,
                senderId,
                baseEvent.getEventType());

        List<ChatParticipant> participants;
        try {
            participants = participantRepository.findByChatIdAndIsActiveTrue(chatId);
            log.info("[CHAT-BROADCAST] Found {} active participants for chatId={}", participants.size(), chatId);
        } catch (Exception e) {
            log.error("[CHAT-BROADCAST] FAILED to fetch participants for chatId={}: {}", chatId, e.getMessage(), e);
            return;
        }

        List<ChatBroadcastPayload.ParticipantDelivery> deliveries = new ArrayList<>();

        for (ChatParticipant participant : participants) {
            UserProfile participantProfile = participant.getUserProfile();
            if (participantProfile == null || participantProfile.getUser() == null) {
                log.warn("[CHAT-BROADCAST] Skipping participant with null profile/user for chatId={}", chatId);
                continue;
            }

            String email = participantProfile.getUser().getEmail();
            if (email == null) {
                log.warn(
                        "[CHAT-BROADCAST] Skipping participant profileId={} with null email",
                        participantProfile.getId());
                continue;
            }

            WebSocketMessageEvent eventToSend = baseEvent;

            boolean isReceivedByPractice = participantProfile.isPractice()
                    && !participantProfile.getId().equals(senderId);

            if (isReceivedByPractice && patientId != null) {
                try {
                    UserProfile ownerProfile = orderRepository
                            .findLatestTargetProfileByPatientIdAndOwnerProfileId(patientId, participantProfile.getId())
                            .orElse(null);

                    if (ownerProfile != null && ownerProfile.getUser() != null) {
                        User ownerUser = ownerProfile.getUser();
                        eventToSend = baseEvent.toBuilder()
                                .senderName(ownerUser.getFirstName() + " " + ownerUser.getLastName())
                                .senderEmail(ownerUser.getEmail())
                                .senderOrganization(ownerProfile.getOrganizationBrandName())
                                .build();
                    }
                } catch (Exception e) {
                    log.warn(
                            "Could not resolve owner profile for practice participant {}: {}",
                            participantProfile.getId(),
                            e.getMessage());
                }
            }

            deliveries.add(ChatBroadcastPayload.ParticipantDelivery.builder()
                    .email(email)
                    .event(eventToSend)
                    .build());
        }

        ChatBroadcastPayload payload = ChatBroadcastPayload.builder()
                .chatId(chatId)
                .senderId(senderId)
                .patientId(patientId)
                .baseEvent(baseEvent)
                .deliveries(deliveries)
                .build();

        broadcastPublisher.publish(payload);

        log.info("[CHAT-BROADCAST] Published to Redis for chatId={}, deliveries={}", chatId, deliveries.size());
    }

    private MessageResponse buildMessageResponse(ChatMessage message) {
        MessageResponse replyToResponse = null;
        if (message.getReplyToMessage() != null && !message.getReplyToMessage().getIsDeleted()) {
            replyToResponse = MessageResponse.builder()
                    .id(message.getReplyToMessage().getId())
                    .textContent(message.getReplyToMessage().getTextContent())
                    .messageType(message.getReplyToMessage().getMessageType())
                    .sender(buildUserProfileInfo(message.getReplyToMessage().getSenderProfile()))
                    .createdAt(message.getReplyToMessage().getCreatedAt())
                    .build();
        }

        AlignerCheckInResponse alignerCheckInResponse = null;
        if (message.getMessageType() == MessageType.ALIGNER_CHECK_IN && message.getAlignerCheckIn() != null) {
            alignerCheckInResponse = buildAlignerCheckInResponse(message.getAlignerCheckIn());
        }

        return MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .messageType(message.getMessageType())
                .textContent(message.getTextContent())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .editedAt(message.getEditedAt())
                .isEdited(message.getIsEdited())
                .sender(buildUserProfileInfo(message.getSenderProfile()))
                .replyToMessage(replyToResponse)
                .attachments(message.getFiles().stream().map(FileDetails::from).toList())
                .alignerCheckIn(alignerCheckInResponse)
                .readReceipts(buildReadReceiptResponses(message))
                .build();
    }

    private MessageResponse buildMessageResponse(
            ChatMessage message, Long requestingProfileId, UserProfile ownerProfile) {
        boolean isReceivedMessage = !message.getSenderProfile().getId().equals(requestingProfileId);

        UserProfile effectiveSender;
        boolean useOrgNameForSender = false;

        if (ownerProfile != null && isReceivedMessage) {
            effectiveSender = ownerProfile;
            useOrgNameForSender = true;
        } else {
            effectiveSender = message.getSenderProfile();
        }

        MessageResponse replyToResponse = null;
        if (message.getReplyToMessage() != null && !message.getReplyToMessage().getIsDeleted()) {
            replyToResponse = MessageResponse.builder()
                    .id(message.getReplyToMessage().getId())
                    .textContent(message.getReplyToMessage().getTextContent())
                    .messageType(message.getReplyToMessage().getMessageType())
                    .sender(buildUserProfileInfo(message.getReplyToMessage().getSenderProfile(), false))
                    .createdAt(message.getReplyToMessage().getCreatedAt())
                    .build();
        }

        AlignerCheckInResponse alignerCheckInResponse = null;
        if (message.getMessageType() == MessageType.ALIGNER_CHECK_IN && message.getAlignerCheckIn() != null) {
            alignerCheckInResponse = buildAlignerCheckInResponse(message.getAlignerCheckIn());
        }

        return MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .messageType(message.getMessageType())
                .textContent(message.getTextContent())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .editedAt(message.getEditedAt())
                .isEdited(message.getIsEdited())
                .sender(buildUserProfileInfo(effectiveSender, useOrgNameForSender))
                .replyToMessage(replyToResponse)
                .attachments(message.getFiles().stream().map(FileDetails::from).toList())
                .alignerCheckIn(alignerCheckInResponse)
                .readReceipts(buildReadReceiptResponses(message))
                .build();
    }

    private UserProfileInfoResponse buildUserProfileInfo(UserProfile profile, boolean useOrgName) {
        String displayName;
        if (useOrgName) {
            displayName = profile.getOrgName();
        } else {
            displayName = profile.getUser() != null ? profile.getUser().fullNameWithSalutation() : null;
        }

        return UserProfileInfoResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(displayName)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .profilePictureUrl(profile.getUser() != null ? profile.getUser().getProfileUrl() : null)
                .profileImageId(
                        profile.getUser() != null && profile.getUser().getProfileImage() != null
                                ? profile.getUser().getProfileImage().getId()
                                : null)
                .organizationName(profile.getOrgName())
                .build();
    }

    public AlignerCheckInResponse buildAlignerCheckInResponse(AlignerCheckIn alignerCheckIn) {
        return AlignerCheckInResponse.builder()
                .id(alignerCheckIn.getId())
                .patientId(alignerCheckIn.getPatient().getId())
                .chatId(alignerCheckIn.getChat().getId())
                .messageId(
                        alignerCheckIn.getMessage() != null
                                ? alignerCheckIn.getMessage().getId()
                                : null)
                .alignerNumber(alignerCheckIn.getAlignerNumber())
                .startAlignerNumber(alignerCheckIn.getStartAlignerNumber())
                .endAlignerNumber(alignerCheckIn.getEndAlignerNumber())
                .notes(alignerCheckIn.getNotes())
                .checkInDate(alignerCheckIn.getCheckInDate())
                .progressPercentage(alignerCheckIn.getProgressPercentage())
                .totalAligners(alignerCheckIn.getTotalAligners())
                .submittedBy(buildUserProfileInfo(alignerCheckIn.getSubmittedBy()))
                .files(alignerCheckIn.getFiles().stream().map(FileDetails::from).toList())
                .build();
    }

    private UserProfileInfoResponse buildUserProfileInfo(UserProfile profile) {
        return UserProfileInfoResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(profile.getUser().fullNameWithSalutation())
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .profilePictureUrl(profile.getUser().getProfileUrl())
                .profileImageId(
                        profile.getUser().getProfileImage() != null
                                ? profile.getUser().getProfileImage().getId()
                                : null)
                .organizationName(profile.getOrgName())
                .build();
    }

    private PaginationDetails buildPaginationDetails(Page<?> page) {
        return PaginationDetails.builder()
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalPatients((int) page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
