package com.dentalstack.patient.feature.storage.gallery.service;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.storage.gallery.dto.AddAlignerPhotoRequest;
import com.dentalstack.patient.feature.storage.gallery.dto.AddPreAlignerPhotoRequest;
import com.dentalstack.patient.feature.storage.gallery.dto.DeleteAlignerPhotosRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface GalleryService {

    AlignerJourney uploadAlignerPhoto(
            AddAlignerPhotoRequest req, MultipartFile photo, String saveAsFilename, boolean sendEvents);

    List<AlignerPhoto> getAlignerPhotos(Long alignerPhotoId);

    List<AlignerPhoto> deleteAlignerPhoto(DeleteAlignerPhotosRequest request);

    AlignerPhoto uploadPhotoByPatient(
            Aligner aligner, long patientId, String saveAsFilename, boolean withAligner, MultipartFile photo);

    AlignerPhoto uploadPhotoByPatientV2(
            Aligner aligner, long patientId, String saveAsFilename, boolean withAligner, MultipartFile photo);

    AlignerJourney uploadAlignerPhotos(AddAlignerPhotoRequest request, MultipartFile[] photos);

    AlignerJourney uploadPreAlignerPhotos(AddPreAlignerPhotoRequest request, MultipartFile[] photos);
}
