package com.dentalstack.patient.feature.dashboardlabel.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "dashboard_label")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardLabels extends BaseEntity {

    private String home;
    private String workspace;
    private String customerView;
    private String labView;
    private long profileId;
}
