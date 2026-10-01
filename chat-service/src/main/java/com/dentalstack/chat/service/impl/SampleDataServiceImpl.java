package com.dentalstack.chat.service.impl;

import com.dentalstack.chat.dto.sampledata.GenerateSampleChatRequest;
import com.dentalstack.chat.entity.Chat;
import com.dentalstack.chat.entity.DoctorPatientChat;
import com.dentalstack.chat.repository.ChatRepository;
import com.dentalstack.chat.repository.DoctorPatientChatRepository;
import com.dentalstack.chat.service.SampleDataService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SampleDataServiceImpl implements SampleDataService {

    private final DoctorPatientChatRepository doctorPatientChatRepository;
    private final ChatRepository chatRepository;

    @Override
    public void generateSampleChats(GenerateSampleChatRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var patientName = request.getPatientName();
        var doctorName = request.getDoctorName();

        if (doctorPatientChatRepository
                .findByPatientIdAndDoctorId(patientId, doctorId)
                .isPresent()) {
            log.info(
                    "Not generating new sample chat because it already exists for patient {} and doctor {}",
                    patientId,
                    doctorId);
            return;
        }

        doctorPatientChatRepository.save(DoctorPatientChat.builder()
                .patientId(patientId)
                .doctorId(doctorId)
                .isAdded(true)
                .build());

        var startDate = LocalDateTime.of(2023, 10, 28, 5, 34, 3, 0);
        var pm = Chat.builder()
                .message(
                        "Hi doctor, I just changed to my new aligners and they're not fitting well. It's uncomfortable.")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Patient")
                .createdBy(patientName)
                .active(true)
                .messageRead(false)
                .build();
        pm.setCreatedAt(startDate);
        chatRepository.save(pm);

        var dm = Chat.builder()
                .message("I understand. Sometimes this can happen. Did you put them in properly?")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Doctor")
                .createdBy(doctorName)
                .active(true)
                .messageRead(false)
                .build();
        dm.setCreatedAt(startDate.plusMinutes(3));
        chatRepository.save(dm);

        pm = Chat.builder()
                .message("Yes, I followed the instructions. But they feel tight and don't snap on completely.")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Patient")
                .createdBy(patientName)
                .active(true)
                .messageRead(false)
                .build();
        pm.setCreatedAt(startDate.plusMinutes(10));
        chatRepository.save(pm);

        dm = Chat.builder()
                .message("That's not uncommon. Your teeth are adjusting. Try using chewies to help them settle.")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Doctor")
                .createdBy(doctorName)
                .active(true)
                .messageRead(false)
                .build();
        dm.setCreatedAt(startDate.plusMinutes(15));
        chatRepository.save(dm);

        pm = Chat.builder()
                .message("Got it, doctor. I'll try chewies. How long should I use them?")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Patient")
                .createdBy(patientName)
                .active(true)
                .messageRead(false)
                .build();
        pm.setCreatedAt(startDate.plusMinutes(30));
        chatRepository.save(pm);

        dm = Chat.builder()
                .message(
                        "Use them for a couple of minutes after putting in your aligners. Let's reassess in 2 days to see if there's improvement.")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Doctor")
                .createdBy(doctorName)
                .active(true)
                .messageRead(false)
                .build();
        dm.setCreatedAt(startDate.plusMinutes(78));
        chatRepository.save(dm);

        pm = Chat.builder()
                .message("Alright, I'll do that. Thanks, doctor. Will report back in 2 days.")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Patient")
                .createdBy(patientName)
                .active(true)
                .messageRead(false)
                .build();
        pm.setCreatedAt(startDate.plusMinutes(79));
        chatRepository.save(pm);

        dm = Chat.builder()
                .message("Sounds good. If you still face issues, we'll explore other solutions. Keep me posted.")
                .patientId(patientId)
                .doctorId(doctorId)
                .imageName("")
                .roleName("Doctor")
                .createdBy(doctorName)
                .active(true)
                .messageRead(false)
                .build();
        dm.setCreatedAt(startDate.plusMinutes(80));
        chatRepository.save(dm);
    }
}
