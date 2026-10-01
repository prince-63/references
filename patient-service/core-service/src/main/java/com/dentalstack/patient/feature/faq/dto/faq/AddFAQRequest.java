package com.dentalstack.patient.feature.faq.dto.faq;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddFAQRequest {
    private String topic;
    private String imageName;
    private String url;
    private String question;
    private String answer;
    private String addedBy;
}
