package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderResponse;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.calendar.dto.calendar.details.CustomAppointmentCalendarDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.global.entity.DraftFile;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.annotation.Nullable;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDetails implements Serializable {

    private static final long serialVersionUID = 1L;

    private ProductTypeName productTypeName;

    private long appointmentId;

    private Double amount;

    private ZonedDateTime currentAppointmentDate;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;

    private ZonedDateTime nextAppointmentDate;

    private AppointmentStatus status;

    @Builder.Default
    private List<JawDetails> jaws = new ArrayList<>();

    private List<FileDetails> files;
    private Set<DraftFile> draftFiles;

    private String firstName;
    private String lastName;
    private String mobile;
    private String email;
    private String countryCode;
    private String practiceLocationName;

    @Nullable
    private CustomAppointmentCalendarDetails reminderDetails;

    public static AppointmentDetails from(Appointment appointment) {
        var patient = appointment.getPatient();

        List<FileDetails> uniqueFiles = new ArrayList<>(appointment.getFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.toMap(
                        FileDetails::getFileId,
                        Function.identity(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new))
                .values());

        return AppointmentDetails.builder()
                .appointmentId(appointment.getId())
                .amount(appointment.getAmount())
                .currentAppointmentDate(appointment.getStartDate())
                .status(appointment.getStatus())
                .productTypeName(appointment.getProductTypeName())
                .jaws(appointment.getJaws().stream().map(JawDetails::from).collect(Collectors.toList()))
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .mobile(patient.getMobileNo())
                .countryCode(
                        patient.getCountryCode() != null
                                ? patient.getCountryCode().getCode()
                                : null)
                .email(patient.getEmail())
                .practiceLocationName(patient.getPracticeLocationName())
                .files(uniqueFiles)
                .draftFiles(new HashSet<>(appointment.getDraftFiles()))
                .startDate(appointment.getStartDate())
                .endDate(appointment.getEndDate())
                .reminderDetails(
                        appointment.getReminder() != null
                                ? CustomAppointmentCalendarDetails.from(
                                        appointment.getReminder(),
                                        appointment.getBracesJourney().getId())
                                : null)
                .build();
    }

    public static AppointmentDetails from(
            @Nullable Appointment appointment, CustomAppointmentReminderResponse reminderDetails) {

        List<FileDetails> uniqueFiles = Optional.ofNullable(appointment)
                .map(Appointment::getFiles)
                .map(files -> files.stream()
                        .map(FileDetails::from)
                        .collect(Collectors.toMap(
                                FileDetails::getFileId, file -> file, (existing, replacement) -> existing))
                        .values()
                        .stream()
                        .toList())
                .orElseGet(ArrayList::new);

        ZonedDateTime startDate = Optional.ofNullable(reminderDetails)
                .map(CustomAppointmentReminderResponse::getStartDate)
                .orElseGet(() -> Optional.ofNullable(appointment)
                        .map(Appointment::getStartDate)
                        .orElse(null));

        ZonedDateTime endDate = Optional.ofNullable(reminderDetails)
                .map(CustomAppointmentReminderResponse::getEndDate)
                .orElseGet(() -> Optional.ofNullable(appointment)
                        .map(Appointment::getEndDate)
                        .orElse(null));

        List<JawDetails> jaws = Optional.ofNullable(reminderDetails)
                .filter(CustomAppointmentReminderResponse::isBracesNotesAdded)
                .map(details -> Optional.ofNullable(appointment)
                        .map(Appointment::getJaws)
                        .map(jawsList -> jawsList.stream().map(JawDetails::from).toList())
                        .orElseGet(ArrayList::new))
                .orElseGet(ArrayList::new);

        return AppointmentDetails.builder()
                .appointmentId(Optional.ofNullable(reminderDetails)
                        .map(CustomAppointmentReminderResponse::getAppointmentId)
                        .orElse(0L))
                .amount(Optional.ofNullable(appointment)
                        .map(Appointment::getAmount)
                        .orElse(null))
                .currentAppointmentDate(Optional.ofNullable(appointment)
                        .map(Appointment::getStartDate)
                        .orElse(null))
                .status(Optional.ofNullable(appointment)
                        .map(Appointment::getStatus)
                        .orElse(null))
                .productTypeName(Optional.ofNullable(appointment)
                        .map(Appointment::getProductTypeName)
                        .orElse(null))
                .jaws(jaws)
                .firstName(Optional.ofNullable(appointment)
                        .map(Appointment::getPatient)
                        .map(Patient::getFirstName)
                        .orElse(null))
                .lastName(Optional.ofNullable(appointment)
                        .map(Appointment::getPatient)
                        .map(Patient::getLastName)
                        .orElse(null))
                .mobile(Optional.ofNullable(appointment)
                        .map(Appointment::getPatient)
                        .map(Patient::getMobileNo)
                        .orElse(null))
                .countryCode(Optional.ofNullable(appointment)
                        .map(Appointment::getPatient)
                        .map(Patient::getCountryCode)
                        .map(CountryCode::getCode)
                        .orElse(null))
                .email(Optional.ofNullable(appointment)
                        .map(Appointment::getPatient)
                        .map(Patient::getEmail)
                        .orElse(null))
                .practiceLocationName(Optional.ofNullable(appointment)
                        .map(Appointment::getPatient)
                        .map(Patient::getPracticeLocationName)
                        .orElse(null))
                .files(uniqueFiles)
                .draftFiles(Optional.ofNullable(appointment)
                        .map(Appointment::getDraftFiles)
                        .map(HashSet::new)
                        .orElse(null))
                .startDate(startDate)
                .endDate(endDate)
                .reminderDetails(Optional.ofNullable(appointment)
                        .map(Appointment::getReminder)
                        .map(reminder -> CustomAppointmentCalendarDetails.from(
                                reminder, appointment.getBracesJourney().getId()))
                        .orElse(null))
                .build();
    }
}
