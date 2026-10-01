package com.dentalstack.patient.feature.app_dentals.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "app_details")
public class AppDetails extends BaseEntity {

    private String appName;
    private String iosAppVersion;
    private String androidAppVersion;
}
