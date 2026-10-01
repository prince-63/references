package com.dentalstack.patient.feature.chat.service.impl;

import com.dentalstack.patient.feature.chat.dto.request.*;
import com.dentalstack.patient.feature.chat.dto.response.*;
import com.dentalstack.patient.feature.chat.dto.response.v2.response.AlignerCheckInResponseV2;
import com.dentalstack.patient.feature.chat.dto.response.v2.response.ChatListResponseV2;
import com.dentalstack.patient.feature.chat.dto.response.v2.response.ChatResponseV2;
import com.dentalstack.patient.feature.chat.dto.response.v2.response.MessageResponseV2;
import com.dentalstack.patient.feature.chat.dto.response.v2.summery.ChatListSummaryV2;
import com.dentalstack.patient.feature.chat.entity.*;
import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.dentalstack.patient.feature.chat.repository.*;
import com.dentalstack.patient.feature.chat.service.PatientChatService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.GenericException;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientChatServiceImpl implements PatientChatService {

    private final DoctorChatRepository doctorChatRepository;
    private final ChatParticipantRepository participantRepository;
    private final CaseTeamRepository caseTeamRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;
    private final AlignerCheckInRepository alignerCheckInRepository;
    private final ChatMessageRepository messageRepository;

    @Override
    @Transactional
    public ChatResponse createChat(CreateChatRequest request) {
        log.info("Creating chat for patient: {}", request.getPatientId());

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found"));

        doctorChatRepository.findActiveByPatientId(patient.getId()).ifPresent(chat -> {
            throw new GenericException("Chat already exists for this patient");
        });

        UserProfile currentUser = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new GenericException("User profile not found"));

        String chatName = request.getChatName() != null
                ? request.getChatName()
                : patient.getFirstName() + " " + (patient.getLastName() != null ? patient.getLastName() : "");

        DoctorChat chat = DoctorChat.builder()
                .patient(patient)
                .chatName(chatName)
                .description(request.getDescription())
                .isActive(true)
                .unreadCount(0)
                .build();

        chat = doctorChatRepository.save(chat);

        ChatParticipant creatorParticipant = ChatParticipant.builder()
                .chat(chat)
                .userProfile(currentUser)
                .joinedAt(ZonedDateTime.now())
                .isActive(true)
                .isOnline(false)
                .isTyping(false)
                .unreadCount(0)
                .build();

        participantRepository.save(creatorParticipant);

        if (request.getParticipantUserProfileIds() != null
                && !request.getParticipantUserProfileIds().isEmpty()) {
            addParticipantsByIds(chat, request.getParticipantUserProfileIds(), currentUser, null);
        }

        if (request.getCaseTeamIds() != null && !request.getCaseTeamIds().isEmpty()) {
            addCaseTeamsToChat(chat, request.getCaseTeamIds(), currentUser);
        }

        log.info("Chat created successfully with ID: {}", chat.getId());
        return buildChatResponse(chat, request.getProfileId());
    }

    @Override
    @Transactional
    public ChatResponse getChatById(GetChatRequest request) {
        DoctorChat chat = doctorChatRepository
                .findByIdWithAllRelations(request.getChatId())
                .orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, request.getProfileId());

        return buildChatResponse(chat, request.getProfileId());
    }

    @Override
    @Transactional
    public ChatResponse getChatByPatientId(Long patientId, Long currentUserProfileId) {
        DoctorChat chat = doctorChatRepository
                .findActiveByPatientId(patientId)
                .orElseThrow(() -> new GenericException("Chat not found for patient"));

        validateUserAccess(chat, currentUserProfileId);

        return buildChatResponse(chat, currentUserProfileId);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatListResponse getMyChats(GetMyChatsRequest request) {

        boolean hasSearchCriteria =
                (!request.getSearch().isEmpty() && !request.getSearch().isBlank())
                        || (request.getCustomerIds() != null
                                && !request.getCustomerIds().isEmpty());

        if (!hasSearchCriteria) {
            return getMyChatsWithoutSearch(request);
        }

        List<Long> patientIds = doctorChatRepository.findPatientIdsByProfileIdAndSearch(
                request.getProfileId(), request.getSearch(), request.getCustomerIds());

        if (patientIds.isEmpty()) {
            return ChatListResponse.builder()
                    .chats(List.of())
                    .paginationDetails(buildEmptyPagination(request))
                    .build();
        }

        int start = request.getPage() * request.getSize();
        int end = Math.min(start + request.getSize(), patientIds.size());

        if (start >= patientIds.size()) {
            return ChatListResponse.builder()
                    .chats(List.of())
                    .paginationDetails(buildPaginationDetails(patientIds.size(), request))
                    .build();
        }

        List<Long> pagedPatientIds = patientIds.subList(start, end);

        List<DoctorChat> chats = doctorChatRepository.findByPatientIdInOrderByLastMessageAtDesc(pagedPatientIds);

        List<ChatResponse> chatResponses = chats.stream()
                .map(chat -> buildChatResponse(chat, request.getProfileId()))
                .collect(Collectors.toList());

        return ChatListResponse.builder()
                .chats(chatResponses)
                .paginationDetails(buildPaginationDetails(patientIds.size(), request))
                .build();
    }

    private ChatListResponse getMyChatsWithoutSearch(GetMyChatsRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<DoctorChat> chatsPage = doctorChatRepository.findChatsByUserProfileId(request.getProfileId(), pageable);

        List<ChatResponse> chatResponses = chatsPage.getContent().stream()
                .map(chat -> buildChatResponse(chat, request.getProfileId()))
                .collect(Collectors.toList());

        return ChatListResponse.builder()
                .chats(chatResponses)
                .paginationDetails(buildPaginationDetails(chatsPage))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ChatListResponse getUnreadChats(GetMyChatsRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Page<DoctorChat> chatsPage =
                doctorChatRepository.findUnreadChatsByUserProfileId(request.getProfileId(), pageable);

        List<ChatResponse> chatResponses = chatsPage.getContent().stream()
                .map(chat -> buildChatResponse(chat, request.getProfileId()))
                .collect(Collectors.toList());

        return ChatListResponse.builder()
                .chats(chatResponses)
                .paginationDetails(buildPaginationDetails(chatsPage))
                .build();
    }

    @Override
    @Transactional
    public ChatResponse addParticipants(AddParticipantsRequest request) {
        DoctorChat chat = doctorChatRepository
                .findByIdWithAllRelations(request.getChatId())
                .orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, request.getProfileId());

        UserProfile currentUser = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new GenericException("User profile not found"));

        if (request.getUserProfileIds() != null && !request.getUserProfileIds().isEmpty()) {
            addParticipantsByIds(chat, request.getUserProfileIds(), currentUser, null);
        }

        if (request.getCaseTeamIds() != null && !request.getCaseTeamIds().isEmpty()) {
            addCaseTeamsToChat(chat, request.getCaseTeamIds(), currentUser);
        }

        return buildChatResponse(chat, request.getProfileId());
    }

    @Override
    @Transactional
    public void removeParticipant(Long chatId, Long userProfileId, Long currentUserProfileId) {
        DoctorChat chat = doctorChatRepository
                .findByIdWithAllRelations(chatId)
                .orElseThrow(() -> new GenericException("Chat not found"));

        validateUserAccess(chat, currentUserProfileId);

        ChatParticipant participant = participantRepository
                .findByChatIdAndUserProfileId(chatId, userProfileId)
                .orElseThrow(() -> new GenericException("Participant not found in chat"));

        participant.setIsActive(false);
        participantRepository.save(participant);

        log.info("Removed participant {} from chat {}", userProfileId, chatId);
    }

    @Override
    @Transactional
    public void markAsRead(Long chatId, Long currentUserProfileId) {
        participantRepository.markAsRead(chatId, currentUserProfileId, ZonedDateTime.now());
        log.debug("Marked chat {} as read for user {}", chatId, currentUserProfileId);
    }

    @Override
    @Transactional
    public void updateTypingStatus(UpdateTypingStatusRequest request, Long currentUserProfileId) {
        participantRepository.updateTypingStatus(
                request.getChatId(), currentUserProfileId, request.getIsTyping(), ZonedDateTime.now());
    }

    @Override
    @Transactional
    public void updateOnlineStatus(Long userProfileId, Boolean isOnline) {
        participantRepository.updateOnlineStatus(userProfileId, isOnline, ZonedDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long currentUserProfileId) {
        return doctorChatRepository.countUnreadChatsByUserProfileId(currentUserProfileId);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatListResponseV2 getMyChatsV2(GetMyChatsRequest request) {
        String search = request.getSearch() != null ? request.getSearch().trim() : "";
        List<Long> customerProfileIds = request.getCustomerIds() != null ? request.getCustomerIds() : List.of();
        boolean customerProfileIdsEmpty = customerProfileIds.isEmpty();

        int limit = request.getSize();
        int offset = request.getPage() * request.getSize();

        long totalCount = doctorChatRepository.countChatSummariesV2(
                request.getProfileId(), search, customerProfileIds, customerProfileIdsEmpty);

        if (totalCount == 0) {
            return ChatListResponseV2.builder()
                    .chats(List.of())
                    .paginationDetails(PaginationDetails.builder()
                            .pageNumber(request.getPage())
                            .pageSize(request.getSize())
                            .totalPatients(0)
                            .totalPages(0)
                            .hasNext(false)
                            .hasPrevious(false)
                            .build())
                    .build();
        }

        List<ChatListSummaryV2> summaries = doctorChatRepository.findChatSummariesV2(
                request.getProfileId(), search, customerProfileIds, customerProfileIdsEmpty, limit, offset);

        int totalPages = (int) Math.ceil((double) totalCount / request.getSize());

        List<ChatResponseV2> chatResponses =
                summaries.stream().map(this::mapToV2Response).collect(Collectors.toList());

        return ChatListResponseV2.builder()
                .chats(chatResponses)
                .paginationDetails(PaginationDetails.builder()
                        .pageNumber(request.getPage())
                        .pageSize(request.getSize())
                        .totalPatients((int) totalCount)
                        .totalPages(totalPages)
                        .hasNext(request.getPage() < totalPages - 1)
                        .hasPrevious(request.getPage() > 0)
                        .build())
                .build();
    }

    private ChatResponseV2 mapToV2Response(ChatListSummaryV2 s) {
        MessageResponseV2 lastMessage = null;
        if (s.getLastMessageId() != null) {
            lastMessage = MessageResponseV2.builder()
                    .id(s.getLastMessageId())
                    .chatId(s.getChatId())
                    .messageType(MessageType.valueOf(s.getLastMessageType()))
                    .textContent(s.getLastMessageTextContent())
                    .isDeleted(s.getLastMessageIsDeleted())
                    .createdAt(s.getLastMessageCreatedAt())
                    .sender(UserProfileInfoResponse.builder()
                            .name(s.getLastMessageSenderName())
                            .build())
                    .build();
        }

        AlignerCheckInResponseV2 checkIn = null;
        if (s.getLatestCheckInId() != null) {
            checkIn = AlignerCheckInResponseV2.builder()
                    .id(s.getLatestCheckInId())
                    .patientId(s.getPatientId())
                    .chatId(s.getCheckInChatId())
                    .messageId(s.getCheckInMessageId())
                    .alignerNumber(s.getAlignerNumber())
                    .startAlignerNumber(s.getStartAlignerNumber())
                    .endAlignerNumber(s.getEndAlignerNumber())
                    .notes(s.getCheckInNotes())
                    .checkInDate(s.getCheckInDate())
                    .progressPercentage(s.getProgressPercentage())
                    .totalAligners(s.getTotalAligners())
                    .submittedBy(
                            s.getCheckInSubmittedByProfileId() != null
                                    ? UserProfileInfoResponse.builder()
                                            .id(s.getCheckInSubmittedByProfileId())
                                            .userId(s.getCheckInSubmittedByUserId())
                                            .name(s.getCheckInSubmittedByName())
                                            .email(s.getCheckInSubmittedByEmail())
                                            .organizationName(s.getCheckInSubmittedByOrgName())
                                            .profilePictureUrl(s.getCheckInSubmittedByProfileUrl())
                                            .build()
                                    : null)
                    .build();
        }

        String patientName =
                s.getPatientFirstName() + (s.getPatientLastName() != null ? " " + s.getPatientLastName() : "");

        return ChatResponseV2.builder()
                .id(s.getChatId())
                .patientId(s.getPatientId())
                .patientName(patientName)
                .patientProfilePicture(s.getPatientProfilePictureUrl())
                .chatName(s.getChatName())
                .description(s.getDescription())
                .isActive(s.getIsActive())
                .createdAt(s.getChatCreatedAt())
                .lastMessageAt(s.getLastMessageAt())
                .unreadCount(s.getUnreadCount())
                .customerMappedId(s.getCustomerMappedId())
                .patientAddedByName(s.getPatientAddedByName())
                .lastMessage(lastMessage)
                .latestAlignerCheckIn(checkIn)
                .build();
    }

    private void addParticipantsByIds(
            DoctorChat chat, List<Long> userProfileIds, UserProfile addedBy, Long caseTeamId) {
        for (Long userProfileId : userProfileIds) {

            if (participantRepository.existsByChatIdAndUserProfileIdAndIsActiveTrue(chat.getId(), userProfileId)) {
                continue;
            }

            UserProfile userProfile = userProfileRepository
                    .findById(userProfileId)
                    .orElseThrow(() -> new GenericException("User profile not found: " + userProfileId));

            ChatParticipant participant = ChatParticipant.builder()
                    .chat(chat)
                    .userProfile(userProfile)
                    .joinedAt(ZonedDateTime.now())
                    .isActive(true)
                    .isOnline(false)
                    .isTyping(false)
                    .unreadCount(0)
                    .addedBy(addedBy)
                    .addedViaCaseTeamId(caseTeamId)
                    .build();

            participantRepository.save(participant);
            log.info("Added participant {} to chat {}", userProfileId, chat.getId());
        }
    }

    private void addCaseTeamsToChat(DoctorChat chat, List<Long> caseTeamIds, UserProfile addedBy) {
        for (Long caseTeamId : caseTeamIds) {
            CaseTeam team = caseTeamRepository
                    .findById(caseTeamId)
                    .orElseThrow(() -> new GenericException("Case team not found: " + caseTeamId));

            chat.getCaseTeams().add(team);

            List<Long> memberIds =
                    team.getMembers().stream().map(UserProfile::getId).collect(Collectors.toList());

            addParticipantsByIds(chat, memberIds, addedBy, caseTeamId);
        }
        doctorChatRepository.save(chat);
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
                participant.setJoinedAt(ZonedDateTime.now());
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
                        .joinedAt(ZonedDateTime.now())
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

    private ChatResponse buildChatResponse(DoctorChat chat, Long currentUserProfileId) {
        Patient patient = chat.getPatient();

        List<ChatParticipant> participants = participantRepository.findByChatIdAndIsActiveTrue(chat.getId());

        ChatParticipant currentUserParticipant = participants.stream()
                .filter(p -> p.getUserProfile().getId().equals(currentUserProfileId))
                .findFirst()
                .orElse(null);

        Integer unreadCount = currentUserParticipant != null ? currentUserParticipant.getUnreadCount() : 0;

        AlignerCheckInResponse latestCheckIn = alignerCheckInRepository
                .findLatestByPatientId(patient.getId())
                .map(this::buildAlignerCheckInResponse)
                .orElse(null);

        MessageResponse lastMessage = messageRepository
                .findMessageIdsByChatId(chat.getId(), org.springframework.data.domain.PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .flatMap(messageRepository::findByIdWithAllRelations)
                .map(this::buildBasicMessageResponse)
                .orElse(null);

        return ChatResponse.builder()
                .id(chat.getId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .patientProfilePicture(patient.getProfilePictureUrl())
                .chatName(chat.getChatName())
                .description(chat.getDescription())
                .isActive(chat.getIsActive())
                .createdAt(chat.getCreatedAt())
                .lastMessageAt(chat.getLastMessageAt())
                .unreadCount(unreadCount)
                .totalParticipants(participants.size())
                .participants(participants.stream()
                        .map(this::buildParticipantResponse)
                        .collect(Collectors.toList()))
                .caseTeams(chat.getCaseTeams().stream()
                        .map(this::buildBasicCaseTeamResponse)
                        .collect(Collectors.toList()))
                .lastMessage(lastMessage)
                .latestAlignerCheckIn(latestCheckIn)
                .customerMappedId(patient.getCustomerMappedId())
                .patientAddedByName(patient.getDoctorOrganization()
                        .getUserProfile()
                        .getUser()
                        .fullNameWithSalutation())
                .build();
    }

    private ChatParticipantResponse buildParticipantResponse(ChatParticipant participant) {
        UserProfile profile = participant.getUserProfile();

        String caseTeamName = null;
        if (participant.getAddedViaCaseTeamId() != null) {
            caseTeamName = caseTeamRepository
                    .findById(participant.getAddedViaCaseTeamId())
                    .map(CaseTeam::getTeamName)
                    .orElse(null);
        }

        return ChatParticipantResponse.builder()
                .id(participant.getId())
                .userProfileId(profile.getId())
                .userName(
                        profile.getUser() != null
                                ? profile.getUser().getFirstName() + " "
                                        + profile.getUser().getLastName()
                                : "Unknown")
                .userEmail(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .organizationName(profile.getOrganizationBrandName())
                .isOnline(participant.getIsOnline())
                .isTyping(participant.getIsTyping())
                .lastSeenAt(participant.getLastSeenAt())
                .joinedAt(participant.getJoinedAt())
                .unreadCount(participant.getUnreadCount())
                .addedViaCaseTeamId(participant.getAddedViaCaseTeamId())
                .addedViaCaseTeamName(caseTeamName)
                .build();
    }

    private CaseTeamResponse buildBasicCaseTeamResponse(CaseTeam team) {
        return CaseTeamResponse.builder()
                .id(team.getId())
                .teamName(team.getTeamName())
                .description(team.getDescription())
                .isActive(team.getIsActive())
                .memberCount(team.getMemberCount())
                .createdAt(team.getCreatedAt())
                .build();
    }

    private MessageResponse buildBasicMessageResponse(ChatMessage message) {
        return MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .messageType(message.getMessageType())
                .textContent(message.getTextContent())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .sender(buildUserProfileInfo(message.getSenderProfile()))
                .build();
    }

    private AlignerCheckInResponse buildAlignerCheckInResponse(AlignerCheckIn checkIn) {
        return AlignerCheckInResponse.builder()
                .id(checkIn.getId())
                .patientId(checkIn.getPatient().getId())
                .chatId(checkIn.getChat().getId())
                .messageId(checkIn.getMessage() != null ? checkIn.getMessage().getId() : null)
                .alignerNumber(checkIn.getAlignerNumber())
                .startAlignerNumber(checkIn.getStartAlignerNumber())
                .endAlignerNumber(checkIn.getEndAlignerNumber())
                .notes(checkIn.getNotes())
                .checkInDate(checkIn.getCheckInDate())
                .progressPercentage(checkIn.getProgressPercentage())
                .totalAligners(checkIn.getTotalAligners())
                .submittedBy(buildUserProfileInfo(checkIn.getSubmittedBy()))
                .build();
    }

    private UserProfileInfoResponse buildUserProfileInfo(UserProfile profile) {
        return getUserProfileInfoResponse(profile);
    }

    static UserProfileInfoResponse getUserProfileInfoResponse(UserProfile profile) {
        return UserProfileInfoResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(profile.getUser().fullNameWithSalutation())
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .organizationName(profile.getOrgName())
                .profilePictureUrl(profile.getUser().getProfileUrl())
                .profileImageId(
                        profile.getUser().getProfileImage() != null
                                ? profile.getUser().getProfileImage().getId()
                                : null)
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

    private PaginationDetails buildPaginationDetails(int totalElements, GetMyChatsRequest request) {
        int totalPages = (int) Math.ceil((double) totalElements / request.getSize());
        int currentPage = request.getPage();
        return PaginationDetails.builder()
                .pageNumber(currentPage)
                .pageSize(request.getSize())
                .totalPatients(totalElements)
                .totalPages(totalPages)
                .hasNext(currentPage < totalPages - 1)
                .hasPrevious(currentPage > 0)
                .build();
    }

    private PaginationDetails buildEmptyPagination(GetMyChatsRequest request) {
        return PaginationDetails.builder()
                .pageNumber(request.getPage())
                .pageSize(request.getSize())
                .totalPatients(0)
                .totalPages(0)
                .hasNext(false)
                .hasPrevious(false)
                .build();
    }
}
