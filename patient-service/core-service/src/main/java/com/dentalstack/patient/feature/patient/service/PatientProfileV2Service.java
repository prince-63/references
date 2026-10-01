package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.ProfileImage;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;

public interface PatientProfileV2Service {
    Patient updateProfilePicture(Long patientId, MultipartFile photo);

    Patient updateProfilePictureUsingBlob(Long patientId, MultipartFile photo);

    PatientDetails updateProfilePictureAndGetDetails(Long patientId, MultipartFile photo);

    PatientDetails updateProfilePictureUsingBlobAndGetDetails(Long patientId, MultipartFile photo);

    Optional<ProfileImage> findByProfilePictureId(Long profilePictureId);
}
