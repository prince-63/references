package com.dentalstack.doctor.entity.organization;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.organization.OrganizationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "organization")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization extends BaseEntity {
    @NotNull
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    private String logo;

    @NotNull
    @Enumerated(EnumType.STRING)
    private OrganizationType type;

    private String registrationNumber;

    private String address;
    private String city;
    private String state;
    private String zip;
    private String countryCode;

    private boolean active;
}
