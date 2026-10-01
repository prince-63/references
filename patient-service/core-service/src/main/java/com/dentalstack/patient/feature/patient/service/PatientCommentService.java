package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.dto.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

public interface PatientCommentService {
    @Transactional
    PatientCommentResponse addComment(AddPatientCommentRequest request, MultipartFile[] files);

    PatientCommentResponse updateComment(UpdatePatientCommentRequest request, MultipartFile[] files);

    void deleteComment(DeletePatientCommentRequest request);

    List<PatientCommentResponse> getPatientComments(Long patientId);

    PatientCommentResponse addCommentV2(AddPatientCommentRequestV2 request, @Valid MultipartFile[] files);

    List<PatientCommentResponse> getPatientCommentsByProfile(GetPatientCommentsByProfileRequest request);
}
