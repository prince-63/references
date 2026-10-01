package com.dentalstack.patient.feature.chat.service.impl;

import static com.dentalstack.patient.feature.chat.service.impl.PatientChatServiceImpl.getUserProfileInfoResponse;

import com.dentalstack.patient.feature.chat.dto.request.CreateAlignerCheckInRequest;
import com.dentalstack.patient.feature.chat.dto.response.AlignerCheckInResponse;
import com.dentalstack.patient.feature.chat.dto.response.UserProfileInfoResponse;
import com.dentalstack.patient.feature.chat.entity.*;
import com.dentalstack.patient.feature.chat.enums.MessageType;
import com.dentalstack.patient.feature.chat.repository.*;
import com.dentalstack.patient.feature.chat.service.AlignerCheckInService;
import com.dentalstack.patient.feature.chat.service.ChatMessageService;
import com.dentalstack.patient.feature.chat.websocket.dto.WebSocketMessageEvent;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.storage.files.dto.UploadFilesRequest;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.exception.GenericException;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlignerCheckInServiceImpl implements AlignerCheckInService {

    private static final String IMAGE_FOLDER_NAME = "images";
    private static final String DOCUMENTS_FOLDER_NAME = "documents";

    private final AlignerCheckInRepository checkInRepository;
    private final DoctorChatRepository chatRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatParticipantRepository participantRepository;
    private final FilesService filesService;
    private final ChatMessageService chatMessageService;

    @Override
    @Transactional
    public AlignerCheckInResponse createCheckIn(CreateAlignerCheckInRequest request, MultipartFile[] files) {
        log.info("Creating aligner check-in for patient: {}", request.getPatientId());

        DoctorChat chat =
                chatRepository.findById(request.getChatId()).orElseThrow(() -> new GenericException("Chat not found"));

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found"));

        UserProfile submitter = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new GenericException("User profile not found"));

        validateUserAccess(chat, request.getProfileId());

        Integer progressPercentage = null;
        if (request.getTotalAligners() != null && request.getAlignerNumber() != null) {
            progressPercentage = (request.getAlignerNumber() * 100) / request.getTotalAligners();
        }

        AlignerCheckIn checkIn = AlignerCheckIn.builder()
                .patient(patient)
                .chat(chat)
                .submittedBy(submitter)
                .alignerNumber(request.getAlignerNumber())
                .startAlignerNumber(request.getStartAlignerNumber())
                .endAlignerNumber(request.getEndAlignerNumber())
                .notes(request.getNotes())
                .checkInDate(ZonedDateTime.now())
                .progressPercentage(progressPercentage)
                .totalAligners(request.getTotalAligners())
                .build();

        checkIn = checkInRepository.save(checkIn);

        if (files != null && files.length > 0) {
            addFiles(files, request, checkIn);
        }

        ChatMessage message = ChatMessage.builder()
                .chat(chat)
                .senderProfile(submitter)
                .messageType(MessageType.ALIGNER_CHECK_IN)
                .textContent(request.getNotes())
                .isDeleted(false)
                .isEdited(false)
                .senderName(
                        submitter.getUser() != null
                                ? submitter.getUser().getFirstName() + " "
                                        + submitter.getUser().getLastName()
                                : "Unknown")
                .senderOrganization(submitter.getOrganizationBrandName())
                .build();

        message = messageRepository.save(message);

        checkIn.setMessage(message);
        checkIn = checkInRepository.save(checkIn);

        chat.setLastMessageAt(message.getCreatedAt());
        chatRepository.save(chat);

        updateUnreadCounts(chat.getId(), request.getProfileId());

        log.info("Aligner check-in created successfully: {}", checkIn.getId());

        WebSocketMessageEvent event = WebSocketMessageEvent.builder()
                .eventType("NEW_MESSAGE")
                .chatId(chat.getId())
                .messageId(message.getId())
                .senderId(submitter.getId())
                .senderName(message.getSenderName())
                .senderEmail(submitter.getUser() != null ? submitter.getUser().getEmail() : null)
                .senderOrganization(message.getSenderOrganization())
                .messageType(MessageType.ALIGNER_CHECK_IN)
                .textContent(message.getTextContent())
                .timestamp(message.getCreatedAt())
                .hasReply(false)
                .attachmentCount(checkIn.getFiles().size())
                .attachments(checkIn.getFiles().stream().map(FileDetails::from).toList())
                .alignerCheckIn(buildAlignerCheckInResponse(checkIn))
                .isDeleted(false)
                .build();

        chatMessageService.broadcastMessageEventToParticipants(chat, event, submitter);

        return buildAlignerCheckInResponse(checkIn);
    }

    private void addFiles(MultipartFile[] files, CreateAlignerCheckInRequest request, AlignerCheckIn checkIn) {

        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        var uploadDetails = filesService.uploadFilesToS3Only(
                new UploadFilesRequest("/Chat", doctorId, Set.of(doctorId, patientId)), files, false);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload some files for aligner check-in: {}", uploadDetails.getFailedToUpload());
        }

        Set<File> existingFiles = new HashSet<>(checkIn.getFiles());
        Set<File> newFiles = new HashSet<>(uploadDetails.getUploadFiles());
        newFiles.removeAll(existingFiles);

        if (!newFiles.isEmpty()) {
            checkIn.getFiles().addAll(newFiles);
            checkInRepository.save(checkIn);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AlignerCheckInResponse getCheckInById(Long checkInId, Long currentUserProfileId) {
        AlignerCheckIn checkIn = checkInRepository
                .findById(checkInId)
                .orElseThrow(() -> new GenericException("Aligner check-in not found"));

        validateUserAccess(checkIn.getChat(), currentUserProfileId);

        return buildAlignerCheckInResponse(checkIn);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AlignerCheckInResponse> getCheckInsByPatient(
            Long patientId, Long currentUserProfileId, Pageable pageable) {
        DoctorChat chat = chatRepository
                .findActiveByPatientId(patientId)
                .orElseThrow(() -> new GenericException("No active chat found for patient"));

        validateUserAccess(chat, currentUserProfileId);

        Page<AlignerCheckIn> checkInsPage =
                checkInRepository.findByPatientIdOrderByAlignerNumberDesc(patientId, pageable);

        return checkInsPage.map(this::buildAlignerCheckInResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AlignerCheckInResponse> getLatestCheckInByPatient(Long patientId, Long currentUserProfileId) {
        DoctorChat chat = chatRepository
                .findActiveByPatientId(patientId)
                .orElseThrow(() -> new GenericException("No active chat found for patient"));

        validateUserAccess(chat, currentUserProfileId);

        return checkInRepository.findLatestByPatientId(patientId).map(this::buildAlignerCheckInResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getMaxAlignerNumber(Long patientId, Long currentUserProfileId) {
        DoctorChat chat = chatRepository
                .findActiveByPatientId(patientId)
                .orElseThrow(() -> new GenericException("No active chat found for patient"));

        validateUserAccess(chat, currentUserProfileId);

        return checkInRepository.findMaxAlignerNumberByPatientId(patientId).orElse(0);
    }

    private void validateUserAccess(DoctorChat chat, Long userProfileId) {
        if (!participantRepository.existsByChatIdAndUserProfileIdAndIsActiveTrue(chat.getId(), userProfileId)) {
            throw new GenericException("Access denied to this chat");
        }
    }

    private void updateUnreadCounts(Long chatId, Long senderProfileId) {
        var participants = participantRepository.findByChatIdAndIsActiveTrue(chatId);

        for (var participant : participants) {
            if (!participant.getUserProfile().getId().equals(senderProfileId)) {
                participant.setUnreadCount(participant.getUnreadCount() + 1);
                participantRepository.save(participant);
            }
        }
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
                .files(checkIn.getFiles().stream().map(FileDetails::from).toList())
                .build();
    }

    private UserProfileInfoResponse buildUserProfileInfo(UserProfile profile) {
        return getUserProfileInfoResponse(profile);
    }
}
