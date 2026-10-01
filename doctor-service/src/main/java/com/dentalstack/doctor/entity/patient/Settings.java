package com.dentalstack.doctor.entity.patient;

import com.dentalstack.doctor.entity.BaseEntity;
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
}
