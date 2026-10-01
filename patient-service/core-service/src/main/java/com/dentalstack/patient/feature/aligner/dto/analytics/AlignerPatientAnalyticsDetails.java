package com.dentalstack.patient.feature.aligner.dto.analytics;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerPatientAnalyticsDetails {

    private Number alignerJourneyId;
    private String patientFullName;
    private String patientProfileUrl;
    private Long patientProfileImageId;
    private String customerMappedId;
    private String email;
    private String countryCode;
    private String mobile;
    private String practiceLocation;
    private Number alignerUpdates;
    private int currentAligner;
    private JawType currentAlignerJawType;
    private Number totalAligners;
    private Compliance compliance;
    private boolean isYourPatient;
    private String assignedPractice;
    private long patientId;
    private AppInviteStatus patientAppInviteStatus;
    private boolean hasPerformedAnyAction;

    public enum Compliance {
        NEED_ATTENTION,
        AT_RISK,
        ON_TRACK
    }
}
