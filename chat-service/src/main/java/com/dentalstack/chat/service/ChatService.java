package com.dentalstack.chat.service;

import com.dentalstack.chat.dto.chat.*;
import com.dentalstack.chat.dto.file.RemoveFilesAndImagesRequest;
import java.io.IOException;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ChatService {

    void createChatAddRequest(AddChatRequest chatAddRequest, MultipartFile[] imageNames) throws Exception;

    ChatAndUnreadMessageResponse getByChatDetailsByDoctorIdAndPatientId(Long doctorId, Long patientId, String roleName);

    void seenMessage(MessageSeenRequest messageSeen);

    List<ChatMessageResponse> getByChatDetailsByDoctorId(Long doctorId, Long organisationId, Long profileId);

    List<ChatResponse> getByPatientId(Long patientId);

    void addPatientToChat(AddPatientToChatRequest addPatientToChatRequest);

    List<ChatImageUrlOfPatient> getChatGalleryImages(Long patientId);

    void sendMultipleChat(AddMultipleChat addMultipleChat) throws IOException;

    void deleteChatByPatientId(Long patientId);

    void removeFilesAndImages(RemoveFilesAndImagesRequest request);

    long getChatUnreadMessageCount(Long doctorId, List<Long> patientIds);

    LatestUnreadMessageResponse getLatestUnreadMessageForPatient(Long patientId);

    void dismissChatPopup(Long chatId, Long patientId);
}
