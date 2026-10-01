package com.dentalstack.patient.feature.settings.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.treatment.enums.Compliance;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "settings")
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Settings extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private int goalTime;

    private int poorValue;
    private int averageValue;
    private int goodValue;

    private boolean enableNotification;
    private boolean chatNotification;

    private boolean soundSet;
    private boolean vibrateSet;

    public static Settings defaultSettings(Patient patient) {
        return Settings.builder()
                .patient(patient)
                .goalTime(20)
                .poorValue(10)
                .averageValue(14)
                .goodValue(22)
                .enableNotification(true)
                .chatNotification(true)
                .soundSet(true)
                .vibrateSet(false)
                .build();
    }

    public Compliance compliance(float wearTimeInSecs) {
        if (wearTimeInSecs < poorValue * 3600L) return Compliance.POOR;
        else if (wearTimeInSecs >= poorValue * 3600L && wearTimeInSecs < averageValue * 3600L)
            return Compliance.AVERAGE;
        else return Compliance.GOOD;
    }
}
