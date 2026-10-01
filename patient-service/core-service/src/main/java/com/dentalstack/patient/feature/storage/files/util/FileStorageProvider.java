package com.dentalstack.patient.feature.storage.files.util;

import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class FileStorageProvider {

    private final FileRepository fileRepository;

    public double calculateDoctorTotalFileSize(Long organizationId) {
        try {
            Long totalSizeInBytes = fileRepository.findTotalStorageSizeByOrganization(organizationId);
            if (totalSizeInBytes == null) {
                totalSizeInBytes = 0L;
            }

            return totalSizeInBytes / (1024.0 * 1024.0);
        } catch (Exception e) {
            log.error("Error calculating total file size for organizationId: {}", organizationId, e);
            return 0.0;
        }
    }

    public double calculateDoctorTotalFileSizeByDoctorId(Long doctorId) {
        try {

            Long totalSizeInBytes = fileRepository.findTotalStorageSizeByOrganization(doctorId);
            if (totalSizeInBytes == null) {
                totalSizeInBytes = 0L;
            }

            return totalSizeInBytes / (1024.0 * 1024.0);
        } catch (Exception e) {
            log.error("Error calculating total file size for doctorId: {}", doctorId, e);
            return 0.0;
        }
    }
}
