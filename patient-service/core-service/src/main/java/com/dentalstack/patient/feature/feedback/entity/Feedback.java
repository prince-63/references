package com.dentalstack.patient.feature.feedback.entity;

import com.dentalstack.patient.feature.feedback.dto.feedback.AddFeedbackRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Feedback extends BaseEntity {
    private int rating;
    private int satisfactionLevel;
    private boolean recommendTheAppToOthers;
    private String suggestions;
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    public static Feedback from(AddFeedbackRequest request, Patient patient) {
        return new Feedback(
                request.getRating(),
                request.getSatisfactionLevel(),
                request.isRecommendTheAppToOthers(),
                request.getSuggestions(),
                true,
                patient);
    }
}
