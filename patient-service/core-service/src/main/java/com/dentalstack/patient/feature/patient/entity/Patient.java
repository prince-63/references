package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.patient.dto.RegisterPatientRequest;
import com.dentalstack.patient.feature.patient.dto.UpdateNewPatientRequest;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.producttype.entity.Product;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.enums.TreatmentServices;
import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.Address;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.enums.language.Language;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import lombok.*;
import org.apache.commons.lang3.StringUtils;
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "profile_image_id")
    @ToString.Exclude
    private ProfileImage profileImage;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Address> addresses = new ArrayList<>();

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private PatientLogin patientLogin;

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
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
    @Builder.Default
    @ToString.Exclude
    private List<Treatment> treatments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
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

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @ToString.Exclude
    private PatientDoctorOrganization doctorOrganization;

    @Enumerated(EnumType.STRING)
    private PatientType patientType;

    private Boolean hasReadExistingPatientForm;

    private LocalDateTime nextFollowUp;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private PatientDetailsMetadata patientDetailsMetadata;

    private Boolean prescriptionRead;
    private Boolean inviteModal;
    private Boolean caseRecord;

    @Builder.Default
    private Long currentStep = 0L;

    @Builder.Default
    private Boolean isTrackingEnabled = false;

    @Builder.Default
    private Boolean isStlFileViewEnabled = false;

    private static final java.security.SecureRandom RANDOM = new java.security.SecureRandom();

    private static String generateUUID() {
        String timeStamp = new SimpleDateFormat("ddHHmmss").format(new java.util.Date());
        int randomSuffix = RANDOM.nextInt(90000) + 10000;
        return "P" + timeStamp + randomSuffix;
    }

    public static Patient from(RegisterPatientRequest request, String uuid) {
        Patient patient = Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .age(request.getAge())
                .email(request.getEmail())
                .mobileNo(request.getMobile())
                .customerMappedId(request.getCustomerMappedId())
                .countryCode(request.getCountryCode())
                .patientStatus(PatientStatus.ACTIVE)
                .UUID(uuid)
                .isEmailVerified(false)
                .gender(request.getGender())
                .language(request.getLanguage() != null ? request.getLanguage() : Language.ENGLISH)
                .isWhitelabel(request.getIsWhitelabel() != null ? request.getIsWhitelabel() : false)
                .orgName(request.getOrgName() != null ? request.getOrgName() : "Dental Stack")
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .patientType(request.getPatientType() != null ? request.getPatientType() : PatientType.NEW_PATIENT)
                .hasReadExistingPatientForm(false)
                .build();
        Address address = Address.from(request.getAddress(), patient);

        patient.setAddresses(Collections.singletonList(address));

        return patient;
    }

    public static Patient from(InvitePatientRequest request, String uuid) {

        return Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(Optional.ofNullable(request.getEmail())
                        .map(String::toLowerCase)
                        .orElse(null))
                .age(request.getAge())
                .gender(request.getGender())
                .customerMappedId(request.getCustomerMappedId())
                .mobileNo(request.getMobile())
                .countryCode(request.getCountryCode())
                .patientStatus(PatientStatus.INACTIVE)
                .UUID(request.getPatientUuid() != null ? request.getPatientUuid() : generateUUID())
                .isEmailVerified(false)
                .productTypeNames(Collections.singletonList(ProductTypeName.UNASSIGNED))
                .chiefComplaint(request.getChiefComplaint())
                .practiceLocationName(request.getPracticeLocation())
                .addedByUserId(request.getInviterId())
                .language(request.getLanguage() != null ? request.getLanguage() : Language.ENGLISH)
                .isWhitelabel(false)
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .patientType(request.getPatientType() != null ? request.getPatientType() : PatientType.NEW_PATIENT)
                .hasReadExistingPatientForm(false)
                .currentStep(request.getCurrentStep())
                .isTrackingEnabled(false)
                .isStlFileViewEnabled(false)
                .build();
    }

    public static Patient from(InvitePatientRequestV2 request) {

        return Patient.builder()
                .firstName(StringUtils.stripStart(request.getFirstName(), null))
                .lastName(request.getLastName())
                .email(Optional.ofNullable(request.getEmail())
                        .map(String::toLowerCase)
                        .orElse(null))
                .age(request.getAge())
                .gender(request.getGender())
                .customerMappedId(request.getCustomerMappedId())
                .mobileNo(request.getMobile())
                .countryCode(request.getCountryCode())
                .patientStatus(PatientStatus.INACTIVE)
                .UUID(request.getPatientUuid() != null ? request.getPatientUuid() : generateUUID())
                .isEmailVerified(false)
                .productTypeNames(Collections.singletonList(ProductTypeName.UNASSIGNED))
                .chiefComplaint(request.getChiefComplaint())
                .practiceLocationName(request.getPracticeLocation())
                .addedByUserId(request.getInviterId())
                .language(request.getLanguage() != null ? request.getLanguage() : Language.ENGLISH)
                .isWhitelabel(false)
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .patientType(request.getPatientType() != null ? request.getPatientType() : PatientType.NEW_PATIENT)
                .hasReadExistingPatientForm(false)
                .practiceLocationId(request.getPracticeLocationId())
                .build();
    }

    public static Patient from(InvitePatientRequest request) {
        return Patient.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(Optional.ofNullable(request.getEmail())
                        .map(String::toLowerCase)
                        .orElse(null))
                .age(request.getAge())
                .gender(request.getGender())
                .customerMappedId(request.getCustomerMappedId())
                .mobileNo(request.getMobile())
                .countryCode(request.getCountryCode())
                .patientStatus(PatientStatus.INACTIVE)
                .UUID(generateUUID())
                .isEmailVerified(false)
                .productTypeName(ProductTypeName.UNASSIGNED)
                .productTypeNames(Collections.singletonList(ProductTypeName.UNASSIGNED))
                .chiefComplaint(request.getChiefComplaint())
                .practiceLocationName(request.getPracticeLocation())
                .addedByUserId(request.getInviterId())
                .language(request.getLanguage() != null ? request.getLanguage() : Language.ENGLISH)
                .isWhitelabel(false)
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .patientType(request.getPatientType() != null ? request.getPatientType() : PatientType.NEW_PATIENT)
                .hasReadExistingPatientForm(false)
                .build();
    }

    public static void updatePatient(Patient patient, UpdateNewPatientRequest request) {
        patient.setCountryCode(request.getCountryCode());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setCustomerMappedId(request.getCustomerMappedId());
        patient.setLastName(request.getLastname());
        patient.setChiefComplaint(request.getChiefComplaint());
        patient.setPracticeLocationName(request.getPracticeLocationName());
        patient.setPracticeLocationId(request.getPracticeLocationId());
        patient.setCity(request.getCity());
        patient.setState(request.getState());
        patient.setCountry(request.getCountry());
    }

    public String fullName() {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }

    public String tagFullName() {
        String f = firstName != null ? firstName.replace(" ", "").trim() : "";
        String l = lastName != null ? lastName.replace(" ", "").trim() : "";

        if (!f.isEmpty() && !l.isEmpty()) {
            return f + "_" + l;
        } else if (!f.isEmpty()) {
            return f;
        } else if (!l.isEmpty()) {
            return l;
        }
        return "";
    }

    public String tagFirstName() {
        String f = firstName != null ? firstName.replace(" ", "").trim() : "";
        if (!f.isBlank()) {
            return f;
        }
        return "";
    }

    public static void updatePatientFromLead(Patient patient, PatientLead patientLead, Long doctorId) {
        patient.setFirstName(patientLead.getFirstName());
        patient.setLastName(patientLead.getLastName());
        patient.setAge(patientLead.getAge());
        patient.setGender(patientLead.getGender() != null ? patientLead.getGender() : patient.getGender());
        patient.setEmail(patientLead.getEmail());
        patient.setMobileNo(patientLead.getMobileNo());
        patient.setCountryCode(patientLead.getCountryCode());
        patient.setPatientStatus(PatientStatus.ACTIVE);
        patient.setUUID(patientLead.getUUID());
        patient.setIsEmailVerified(patientLead.getIsEmailVerified());
        patient.setDoctorId(doctorId);
        patient.setLanguage(patientLead.getLanguage());
        patient.setWhitelabel(patientLead.isWhitelabel());
        patient.setOrgName(patientLead.getOrgName());
        patient.setCity(patientLead.getCity() != null ? patientLead.getCity() : patient.getCity());
        patient.setState(patientLead.getState() != null ? patientLead.getState() : patient.getState());
        patient.setCountry(patientLead.getCountry() != null ? patientLead.getCountry() : patient.getCountry());
        patient.setAddresses(Address.convertAddressLeadToAddressList(patientLead.getAddresses(), patient));
    }

    public boolean isYourPatient(Patient patient, Long profileId) {
        return Optional.ofNullable(patient)
                .map(Patient::getDoctorOrganization)
                .map(PatientDoctorOrganization::getAddedByUserProfile)
                .map(UserProfile::getId)
                .map(id -> id.equals(profileId))
                .orElse(false);
    }
}
