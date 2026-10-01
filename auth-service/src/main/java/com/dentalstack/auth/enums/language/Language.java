package com.dentalstack.auth.enums.language;

import java.util.Locale;

public enum Language {
    ENGLISH("en"),
    HINDI("hi"),
    SPANISH("es"),
    FRENCH("fr");

    private final String localeCode;

    Language(String localeCode) {
        this.localeCode = localeCode;
    }

    public Locale getLocale() {
        return Locale.forLanguageTag(this.localeCode);
    }
}
