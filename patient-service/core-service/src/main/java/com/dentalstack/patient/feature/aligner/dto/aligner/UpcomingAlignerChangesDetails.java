package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerChangeStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpcomingAlignerChangesDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<UpcomingAlignerChange> upcomingAlignerChanges = new ArrayList<>();

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpcomingAlignerChange implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private long alignerJourneyId;
        private long patientId;

        private int currentAlignerNo;

        @NotNull
        private JawType currentAlignerJawType;

        @NotNull
        private Compliance currentAlignerCompliance;

        private Float currentAlignerAvgWearTimeInSecs;

        private Integer nextAlignerNo;
        private JawType nextAlignerJawType;

        private LocalDate changeDate;

        private int recommendedHoursToWearAligners;

        private String mobileNo;
        private String patientName;
        private String patientProfile;
        private CountryCode countryCode;
        private AlignerChangeStatus alignerChangeStatus;
        private LocalDate currentAlignerEndDate;
        private Integer changeOffset;
        private boolean isPatientConnected;
        private TrackingType trackingType;
    }
}
