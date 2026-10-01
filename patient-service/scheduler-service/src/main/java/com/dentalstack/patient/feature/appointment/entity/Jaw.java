package com.dentalstack.patient.feature.appointment.entity;

import com.dentalstack.patient.feature.appointment.dto.JawDetails;
import com.dentalstack.patient.feature.treatment.enums.JawType;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "jaw")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class Jaw extends BaseEntity {

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private MaterialMetaData materialMetaData;

    @Enumerated(EnumType.STRING)
    private JawType jawType;

    @Column(columnDefinition = "TEXT")
    private String note;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    public static List<Jaw> createJaws(List<JawDetails> jawDetails, Appointment appointment) {
        List<Jaw> jaws = new ArrayList<>();
        if (jawDetails != null) {
            for (JawDetails detail : jawDetails) {
                Jaw jaw = Jaw.builder()
                        .materialMetaData(new MaterialMetaDataSet(
                                detail.getShape(),
                                detail.getMaterialName(),
                                detail.getMaterialSize(),
                                detail.getSpaceEnclosureTools(),
                                detail.getAccessories(),
                                detail.getTreatmentStageType()))
                        .jawType(detail.getJawType())
                        .note(detail.getNote())
                        .appointment(appointment)
                        .build();
                jaws.add(jaw);
            }
        }
        return jaws;
    }
}
