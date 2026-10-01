package com.dentalstack.patient.feature.prescription.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "prescription")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    private String treatmentNeeded;
    private String doNotMoveTheFollowingTooth;
    private String midline;
    private String attachments;
    private String interProximalReduction;
    private String extraction;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String midlineInstructions;
    private List<String> attachmentsToothSelected;
    private List<String> extractionToothSelected;
    private List<String> treatmentNeededForTooth;
    private List<String> doNotMoveTheFollowingSelectedTooth;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode data;

    private String formId;
    private String orderId;
}
