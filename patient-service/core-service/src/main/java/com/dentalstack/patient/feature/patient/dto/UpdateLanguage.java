package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.language.Language;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateLanguage {

    private long userId;
    private Language language;
}
