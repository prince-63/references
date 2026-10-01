package com.dentalstack.patient.feature.faq.entity;

import com.dentalstack.patient.feature.faq.dto.faq.AddFAQRequest;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "faq")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQ extends BaseEntity {
    private String topic;
    private String imageUrl;
    private String question;
    private String answer;
    private String addedBy;
    private boolean active;

    public static FAQ from(AddFAQRequest req, String imageUrl) {
        return FAQ.builder()
                .topic(req.getTopic())
                .imageUrl(imageUrl)
                .question(req.getQuestion())
                .answer(req.getAnswer())
                .addedBy(req.getAddedBy())
                .active(true)
                .build();
    }
}
