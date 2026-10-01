package com.dentalstack.patient.global.enums;

import java.util.Locale;

public enum Language {
    ENGLISH("en"),
    HINDI("hi"),
    FRENCH("fr"),
    SPANISH("es");

    private final String localeCode;

    Language(String localeCode) {
        this.localeCode = localeCode;
    }

    public Locale getLocale() {
        return Locale.forLanguageTag(this.localeCode);
    }
}
