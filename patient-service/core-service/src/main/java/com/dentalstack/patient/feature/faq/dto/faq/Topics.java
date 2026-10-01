package com.dentalstack.patient.feature.faq.dto.faq;

import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Topics {
    private Set<String> topics;
}
