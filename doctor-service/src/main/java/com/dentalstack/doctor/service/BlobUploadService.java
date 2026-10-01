package com.dentalstack.doctor.service;

import com.dentalstack.doctor.entity.user.ProfileImage;
import com.dentalstack.doctor.enums.user.ProfileImageType;
import org.springframework.web.multipart.MultipartFile;

public interface BlobUploadService {
    ProfileImage uploadIntoDB(Long id, MultipartFile file, ProfileImageType type);

    void removeImage(Long id);
}
