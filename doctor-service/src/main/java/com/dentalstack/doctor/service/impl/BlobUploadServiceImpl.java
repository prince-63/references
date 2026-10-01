package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.entity.user.ProfileImage;
import com.dentalstack.doctor.enums.user.ProfileImageType;
import com.dentalstack.doctor.repository.ProfileImageRepository;
import com.dentalstack.doctor.service.BlobUploadService;
import java.io.IOException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@AllArgsConstructor
public class BlobUploadServiceImpl implements BlobUploadService {
    private final ProfileImageRepository profileImageRepository;

    @Override
    @Transactional
    public ProfileImage uploadIntoDB(Long id, MultipartFile file, ProfileImageType type) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        try {
            ProfileImage image;

            if (id != null) {
                image = profileImageRepository
                        .findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Profile image not found for id: " + id));
            } else {
                image = new ProfileImage();
            }

            image.setImageName(file.getOriginalFilename());
            image.setContentType(file.getContentType());
            image.setImageData(file.getBytes());
            image.setType(type);

            return profileImageRepository.save(image);

        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload image", ex);
        }
    }

    @Override
    @Transactional
    public void removeImage(Long id) {
        if (id == null) {
            return;
        }

        ProfileImage image = profileImageRepository.findById(id).orElse(null);
        if (image == null) {
            return;
        }

        profileImageRepository.delete(image);
        profileImageRepository.flush();
    }
}
