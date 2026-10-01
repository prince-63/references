package com.dentalstack.patient.feature.treatment.util;

import com.dentalstack.patient.feature.storage.exception.PhotoNotUploadedException;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Objects;
import org.springframework.web.multipart.MultipartFile;

public class AlignerJourneyUtils {
    public static float getTreatmentCompletionPercentage(
            @NotNull LocalDate startDate, @NotNull LocalDate endDate, @NotNull LocalDate currentDate) {
        if (currentDate.isBefore(startDate)) {
            return 0F;
        }

        if (endDate.isAfter(currentDate)) {
            var total = startDate.until(endDate, ChronoUnit.DAYS) + 1;
            var untilCurrentDate = startDate.until(currentDate, ChronoUnit.DAYS) + 1;

            return (untilCurrentDate * 100) / (float) total;
        } else {
            return 100F;
        }
    }

    public static MultipartFile filterPhotoWithName(MultipartFile[] photos, String photoFileName) {
        return Arrays.stream(photos)
                .filter(multipartFile -> Objects.equals(multipartFile.getOriginalFilename(), photoFileName))
                .findFirst()
                .orElseThrow(() -> new PhotoNotUploadedException(photoFileName));
    }
}
