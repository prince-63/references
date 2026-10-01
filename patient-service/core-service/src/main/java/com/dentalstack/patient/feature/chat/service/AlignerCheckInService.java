package com.dentalstack.patient.feature.chat.service;

import com.dentalstack.patient.feature.chat.dto.request.CreateAlignerCheckInRequest;
import com.dentalstack.patient.feature.chat.dto.response.AlignerCheckInResponse;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface AlignerCheckInService {

    AlignerCheckInResponse createCheckIn(CreateAlignerCheckInRequest request, MultipartFile[] files);

    AlignerCheckInResponse getCheckInById(Long checkInId, Long currentUserProfileId);

    Page<AlignerCheckInResponse> getCheckInsByPatient(Long patientId, Long currentUserProfileId, Pageable pageable);

    Optional<AlignerCheckInResponse> getLatestCheckInByPatient(Long patientId, Long currentUserProfileId);

    Integer getMaxAlignerNumber(Long patientId, Long currentUserProfileId);
}
