package com.dentalstack.patient.feature.storage_stats.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "doctor_storage_stats")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorageStats extends BaseEntity {
    private int totalPatient;
    private int totalStorageInGb;
}
