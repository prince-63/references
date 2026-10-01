package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "country")
public class Country extends BaseEntity {
    private String iso3;
    private String name;
    private String iso2;
    private String numericCode;
    private String phoneCode;
    private String capital;
    private String currency;
    private String currencyName;
    private String currencySymbol;
    private String tld;
    private String nativeName;
    private String region;
    private int regionId;
    private String subregion;
    private int subregionId;
    private String nationality;

    @Column(columnDefinition = "TEXT")
    private String timezones;

    private double latitude;
    private double longitude;
    private String emoji;
    private String emojiU;
}
