package com.dentalstack.patient.feature.application_info.entity;

import com.dentalstack.patient.feature.application_info.enums.ServiceName;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "application_info")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationInfo {
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @Column(name = "version")
    private String version;

    @Column(name = "service_name")
    @Enumerated(EnumType.STRING)
    private ServiceName serviceName;
}
