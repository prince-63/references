package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.doctor.entity.organization.PatientDoctorOrganization;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.product.entity.Product;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.settings.entity.Settings;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.enums.TreatmentServices;
import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.feature.user.entity.Address;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.Language;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.lang.Nullable;

@Entity
@Table(
        name = "patient",
        indexes = {
            @Index(name = "UX_patient_UUID", columnList = "UUID", unique = true),
            @Index(name = "IX_patient_email", columnList = "email"),
            @Index(name = "IX_patient_mobile_no", columnList = "mobileNo"),
            @Index(name = "IX_patient_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_patient_doctor_id_patient_status", columnList = "doctorId, patientStatus"),
            @Index(name = "IX_patient_mobile_country_code_email", columnList = "mobileNo, countryCode, email"),
            @Index(name = "IX_patient_first_name_last_name_email", columnList = "firstName, lastName, email"),
            @Index(name = "IX_patient_added_by_user_id", columnList = "addedByUserId")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {
    @NotNull
    private String firstName;

    private String lastName;

    private String profilePictureUrl;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private PatientLogin patientLogin;

    @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER)
    @Builder.Default
    private List<PatientInvitation> invitations = new ArrayList<>();

    private Long doctorId;

    private Integer age;

    private String gender;

    private String customerMappedId;

    private String email;

    private Boolean isEmailVerified;

    private String mobileNo;

    @Enumerated(EnumType.STRING)
    private CountryCode countryCode;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PatientStatus patientStatus;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private PatientKYC patientKYC;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private Settings settings;

    @NotNull
    private String UUID;

    @Enumerated(EnumType.STRING)
    private List<ProductTypeName> productTypeNames;

    @Enumerated(EnumType.STRING)
    private ProductTypeName productTypeName;

    @Enumerated(EnumType.STRING)
    private List<TreatmentType> treatmentType;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    private Long practiceLocationId;

    private String practiceLocationName;

    @Enumerated(EnumType.STRING)
    private TreatmentServices treatmentServices;

    @OneToMany(mappedBy = "patient", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Treatment> treatments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Product> product = new ArrayList<>();

    @Nullable
    private ZonedDateTime archivedAt;

    private Long addedByUserId;

    @Enumerated(EnumType.STRING)
    private Language language;

    private boolean isWhitelabel;
    private String orgName;
    private Boolean isGettingStartedMarkedAllAsRead;
    private Boolean isPatientDetailsEdited;

    private String country;
    private String city;
    private String state;
    private ZonedDateTime connectionDate;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private PatientDoctorOrganization doctorOrganization;

    public String fullName() {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }
}
