package com.dentalstack.doctor.entity.patient;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.patient.organization.PatientDoctorOrganization;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.enums.patient.*;
import com.dentalstack.doctor.enums.user.CountryCode;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.text.SimpleDateFormat;
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

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private PatientLogin patientLogin;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @ToString.Exclude
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

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private PatientKYC patientKYC;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
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

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private List<Treatment> treatments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private PatientDoctorOrganization doctorOrganization;

    private static String generateUUID() {
        String timeStamp = new SimpleDateFormat("ddHHmmss").format(new Date());
        return "P" + timeStamp;
    }
}
