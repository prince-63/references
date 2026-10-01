package com.dentalstack.patient.feature.appointment.service;

import com.dentalstack.patient.feature.appointment.dto.AppointmentDetails;
import com.dentalstack.patient.feature.appointment.dto.CreateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.dto.UpdateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import jakarta.annotation.Nullable;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface AppointmentService {

    AppointmentDetails createAppointment(CreateAppointmentRequest request, MultipartFile[] files);

    Appointment getAppointment(Long appointmentId);

    List<Appointment> getAppointment(long doctorId, @Nullable Long patientId);

    void deleteAppointment(long appointmentId);

    Appointment updateAppointment(UpdateAppointmentRequest request);

    Appointment addFiles(long appointmentId, long doctorId, MultipartFile[] files);

    List<Appointment> getAppointmentOfDoctor(long doctorId);

    void todayAppointmentReminder();
}
