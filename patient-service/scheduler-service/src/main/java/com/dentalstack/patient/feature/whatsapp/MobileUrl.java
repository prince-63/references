package com.dentalstack.patient.feature.whatsapp;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MobileUrl {
    PATH("/openapp");

    private final String key;
}
