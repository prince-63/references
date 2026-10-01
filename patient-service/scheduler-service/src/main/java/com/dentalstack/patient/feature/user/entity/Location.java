package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "locations")
public class Location extends BaseEntity {
    private String cityId;
    private String name;
    private String stateId;
    private String stateCode;
    private String stateName;
    private String countryId;
    private String countryCode;
    private String countryName;
    private String latitude;
    private String longitude;
    private String wikiDataId;

    public static Location from(Location location) {
        return Location.builder()
                .cityId(location.getCityId())
                .name(location.getName())
                .stateCode(location.getStateCode())
                .stateId(location.getStateId())
                .stateName(location.getStateName())
                .countryId(location.getCountryId())
                .countryCode(location.getCountryCode())
                .countryName(location.getCountryName())
                .build();
    }

    public void updateFields(Location location) {
        this.name = location.getName();
        this.stateCode = location.getStateCode();
        this.stateId = location.stateId;
        this.stateName = location.stateName;
        this.countryCode = location.countryCode;
        this.countryName = location.countryName;
        this.latitude = location.latitude;
        this.longitude = location.longitude;
        this.wikiDataId = location.wikiDataId;
    }
}
