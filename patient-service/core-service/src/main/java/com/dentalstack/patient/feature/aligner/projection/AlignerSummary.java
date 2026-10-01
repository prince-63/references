package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

public interface AlignerSummary {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getMobileNo();

    CountryCode getCountryCode();

    String getProfilePictureUrl();

    Long getAlignerJourneyId();

    AlignerTreatmentStatus getTreatmentStatus();

    ProgressStatus getProgressStatus();

    LocalDate getTreatmentStartDate();

    JawType getCurrentAlignerJawType();

    Integer getCurrentAlignerSrNo();

    Integer getTotalAligners();

    String getBrandName();

    LocalDate getStartDate();

    LocalDate getEndDate();

    Integer getDaysRemaining();

    String getPracticeLocationName();

    LocalDate getTreatmentPauseDate();

    String getEmail();

    ZonedDateTime getTreatmentCompleteDate();

    Integer getStartAlignerNo();

    Integer getCurrentAlignerNo();

    Integer getRecommendedHoursToWearAligners();

    LocalDateTime getActualStartDate();

    Compliance getCompliance();

    Double getComplianceRatio();

    Integer getDaysWithData();

    Long getTotalWearTime();

    Integer getDaysSinceStart();
}
