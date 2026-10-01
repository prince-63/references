package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.client.PatientServiceClient;
import com.dentalstack.chat.dto.chat.*;
import com.dentalstack.chat.dto.chat.GetFilesRequest;
import com.dentalstack.chat.dto.doctor.SuperAdminRequest;
import com.dentalstack.chat.dto.file.FileDetailsV2;
import com.dentalstack.chat.entity.Chat;
import com.dentalstack.chat.repository.ChatRepository;
import com.dentalstack.chat.service.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class ChatServiceV2Impl implements ChatServiceV2 {
    private final ChatRepository chatRepository;
    private final PatientService patientService;
    private final PatientServiceClient patientServiceClient;

    @Override
    public ChatAndUnreadMessageV2Response getByChatDetailsByDoctorIdAndPatientId(
            Long doctorId, Long patientId, String roleName) {

        var superAdminDetails = patientService.getSuperAdminDetails(
                SuperAdminRequest.builder().doctorId(doctorId).build());
        if (superAdminDetails != null) {
            doctorId = superAdminDetails.getDoctorId();
        }
        List<ChatResponseV2> chatResponseReturn = new ArrayList<>();

        List<Chat> chatList = chatRepository.findByDoctorIdAndPatientIdAndActiveTrueOrderByIdAsc(doctorId, patientId);

        List<Chat> unreadMessageCount = new ArrayList<>();

        if (roleName.equalsIgnoreCase("Patient")) {
            unreadMessageCount = chatRepository.findByDoctorIdAndPatientIdAndMessageReadFalseAndRoleName(
                    doctorId, patientId, "Doctor");
        } else if (roleName.equalsIgnoreCase("doctor")) {
            unreadMessageCount = chatRepository.findByDoctorIdAndPatientIdAndMessageReadFalseAndRoleName(
                    doctorId, patientId, "Patient");
        }

        if (unreadMessageCount == null) {
            unreadMessageCount = new ArrayList<>();
        }

        ChatPatientResponse patientResponse = patientService.getPatientResponse(patientId);

        List<Long> fileIds = new ArrayList<>();
        List<Long> unreadMessageIdList = new ArrayList<>();
        for (Chat chat : unreadMessageCount) {
            unreadMessageIdList.add(chat.getId());
            if (chat.getFileIds() != null && !chat.getFileIds().isEmpty()) {
                fileIds.addAll(chat.getFileIds());
            }
        }

        for (Chat chat : chatList) {
            if (chat.getFileIds() != null && !chat.getFileIds().isEmpty()) {
                fileIds.addAll(chat.getFileIds());
            }
        }

        Map<Long, FileDetailsV2> filesMap = new HashMap<>();
        if (!fileIds.isEmpty()) {
            try {
                List<FileDetailsV2> files = patientServiceClient.getFilesById(
                        GetFilesRequest.builder().fileIds(fileIds).build());

                filesMap = files.stream()
                        .collect(Collectors.toMap(
                                FileDetailsV2::getFileId, Function.identity(), (existing, replacement) -> existing));
            } catch (Exception e) {
                log.error("Failed to fetch files by IDs: {}", fileIds, e);
            }
        }

        if (!chatList.isEmpty()) {
            ChatAndUnreadMessageV2Response chatAndUnreadMessageV2Response = new ChatAndUnreadMessageV2Response();
            Long alignerJourneyId = patientService.getAlignerJourneyIdOfPatient(patientId);

            for (Chat chat : chatList) {
                ChatResponseV2 chatResponse = ChatResponseV2.from(chat, patientResponse, alignerJourneyId, filesMap);
                chatResponseReturn.add(chatResponse);
            }
            String fullName = patientResponse.getFirstName();
            if (patientResponse.getLastName() != null) {
                fullName += " " + patientResponse.getLastName();
            }
            chatAndUnreadMessageV2Response.setChatResponseList(chatResponseReturn);
            chatAndUnreadMessageV2Response.setUnreadMessageCount((long) unreadMessageCount.size());
            chatAndUnreadMessageV2Response.setUnreadMessageIds(unreadMessageIdList);
            chatAndUnreadMessageV2Response.setAlignerJourneyId(alignerJourneyId);
            chatAndUnreadMessageV2Response.setFullName(fullName);
            chatAndUnreadMessageV2Response.setPatientName(
                    patientResponse.getFirstName() + " " + patientResponse.getLastName());
            chatAndUnreadMessageV2Response.setPatientProfile(patientResponse.getProfileImage());
            return chatAndUnreadMessageV2Response;
        } else {

            String fullName = patientResponse.getFirstName();
            if (patientResponse.getLastName() != null) {
                fullName += " " + patientResponse.getLastName();
            }

            ChatAndUnreadMessageV2Response chatAndUnreadMessageV2Response = new ChatAndUnreadMessageV2Response();
            chatAndUnreadMessageV2Response.setFullName(fullName);

            chatAndUnreadMessageV2Response.setPatientName(
                    patientResponse.getFirstName() + " " + patientResponse.getLastName());
            chatAndUnreadMessageV2Response.setPatientProfile(patientResponse.getProfileImage());
            return chatAndUnreadMessageV2Response;
        }
    }
}
