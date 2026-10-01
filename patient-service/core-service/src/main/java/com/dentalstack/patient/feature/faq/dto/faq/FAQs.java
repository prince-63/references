package com.dentalstack.patient.feature.faq.dto.faq;

import com.dentalstack.patient.feature.faq.entity.FAQ;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FAQs {
    private List<FAQDetails> faqs;

    public static FAQs from(List<FAQ> faqs) {
        return new FAQs(faqs.stream().map(FAQDetails::from).toList());
    }
}
