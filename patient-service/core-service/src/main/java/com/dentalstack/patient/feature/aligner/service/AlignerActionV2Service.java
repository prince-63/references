package com.dentalstack.patient.feature.aligner.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerPhotosByAlignerResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.CheckInAlignerRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface AlignerActionV2Service {
    void checkIn(CheckInAlignerRequest request, MultipartFile[] photos);

    List<AlignerPhotosByAlignerResponse> getPhotosByPatientIdGroupedByAligner(Long patientId);
}
