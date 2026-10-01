package com.dentalstack.doctor.entity.patient;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.user.CountryCode;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "patient_login")
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PatientLogin extends BaseEntity {
    @NotNull
    private String mobileNo;

    @NotNull
    private CountryCode countryCode;

    private ZonedDateTime lastLoginAt;
    private String referralCode;

    @OneToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
