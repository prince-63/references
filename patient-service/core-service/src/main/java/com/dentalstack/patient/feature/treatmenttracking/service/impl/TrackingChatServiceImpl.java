package com.dentalstack.patient.feature.treatmenttracking.service.impl;

import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.AlignerReviewRequest;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.ChatHistoryResponse;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.ChatMessageResponse;
import com.dentalstack.patient.feature.treatmenttracking.dto.chat.SendMessageRequest;
import com.dentalstack.patient.feature.treatmenttracking.entity.AlignerReview;
import com.dentalstack.patient.feature.treatmenttracking.entity.TrackingChatMessage;
import com.dentalstack.patient.feature.treatmenttracking.enums.ChatEventType;
import com.dentalstack.patient.feature.treatmenttracking.enums.ReviewStatus;
import com.dentalstack.patient.feature.treatmenttracking.enums.SenderType;
import com.dentalstack.patient.feature.treatmenttracking.repository.AlignerReviewRepository;
import com.dentalstack.patient.feature.treatmenttracking.repository.AlignerStageRepository;
import com.dentalstack.patient.feature.treatmenttracking.repository.TrackingChatMessageRepository;
import com.dentalstack.patient.feature.treatmenttracking.service.TrackingChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingChatServiceImpl implements TrackingChatService {

    private final TrackingChatMessageRepository chatRepo;
    private final PatientRepository patientRepo;
    private final AlignerStageRepository stageRepo;
    private final AlignerReviewRepository reviewRepo;
    private final FileRepository fileRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void sendMessage(SendMessageRequest req, Long senderUserId, SenderType senderType) {
        var patient =
                patientRepo.findById(req.getPatientId()).orElseThrow(() -> new RuntimeException("Patient not found"));

        var msg = TrackingChatMessage.builder()
                .patient(patient)
                .senderType(senderType)
                .senderId(senderUserId)
                .message(req.getMessage())
                .isRead(false)
                .build();

        if (req.getAttachmentFileIds() != null && !req.getAttachmentFileIds().isEmpty()) {
            List<File> attachments = fileRepository.findAllById(req.getAttachmentFileIds());
            msg.setAttachments(new ArrayList<>(attachments));
        }

        chatRepo.save(msg);
    }

    @Override
    @Transactional
    public void postActivity(Long patientId, SenderType senderType, Long senderId, ChatEventType eventType) {
        var patient = patientRepo.findById(patientId).orElseThrow(() -> new RuntimeException("Patient not found"));

        chatRepo.save(TrackingChatMessage.builder()
                .patient(patient)
                .senderType(senderType)
                .senderId(senderId)
                .eventType(eventType)
                .isRead(false)
                .build());
    }

    @Override
    public ChatHistoryResponse getChatHistory(Long patientId, int page, int size) {
        Page<TrackingChatMessage> pageResult = chatRepo.findByPatientIdOrderByCreatedAtDesc(
                patientId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<ChatMessageResponse> messages =
                pageResult.getContent().stream().map(this::toResponse).collect(Collectors.toList());

        var resp = new ChatHistoryResponse();
        resp.setMessages(messages);
        resp.setPage(page);
        resp.setSize(size);
        resp.setTotalElements(pageResult.getTotalElements());
        return resp;
    }

    @Override
    @Transactional
    public void markAsRead(Long patientId, Long readerUserId) {
        chatRepo
                .findByPatientIdOrderByCreatedAtDesc(patientId, PageRequest.of(0, Integer.MAX_VALUE))
                .getContent()
                .stream()
                .filter(m -> Boolean.FALSE.equals(m.getIsRead()))
                .forEach(m -> {
                    m.setIsRead(true);
                    m.setReadAt(ZonedDateTime.now());
                });
    }

    @Override
    @Transactional
    public void submitAlignerReview(AlignerReviewRequest req, Long patientUserId) {
        var patient =
                patientRepo.findById(req.getPatientId()).orElseThrow(() -> new RuntimeException("Patient not found"));
        var stage = stageRepo
                .findById(req.getAlignerStageId())
                .orElseThrow(() -> new RuntimeException("Aligner stage not found"));

        var review = AlignerReview.builder()
                .patient(patient)
                .alignerStage(stage)
                .fitFeedback(req.getFitFeedback())
                .painFeedback(req.getPainFeedback())
                .patientNote(req.getPatientNote())
                .reviewStatus(ReviewStatus.SUBMITTED)
                .build();

        if (req.getPhotoFileIds() != null && !req.getPhotoFileIds().isEmpty()) {
            List<File> photos = fileRepository.findAllById(req.getPhotoFileIds());
            review.setPhotos(new ArrayList<>(photos));
        }

        reviewRepo.save(review);

        postActivity(patient.getId(), SenderType.PATIENT, patientUserId, ChatEventType.ALIGNER_REVIEW_SUBMITTED);
    }

    private ChatMessageResponse toResponse(TrackingChatMessage msg) {
        var r = new ChatMessageResponse();
        r.setId(msg.getId());
        r.setSenderType(msg.getSenderType());
        r.setSenderId(msg.getSenderId());
        r.setMessage(msg.getMessage());
        r.setEventType(msg.getEventType());
        r.setAttachments(
                msg.getAttachments() != null
                        ? msg.getAttachments().stream()
                                .map(f -> ChatMessageResponse.AttachmentFileResponse.builder()
                                        .fileId(f.getId())
                                        .fileName(f.getName())
                                        .url(f.getUrl())
                                        .build())
                                .collect(Collectors.toList())
                        : List.of());
        r.setIsRead(msg.getIsRead());
        r.setCreatedAt(msg.getCreatedAt());
        return r;
    }
}
