package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.appointment.entity.Appointment;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllAppointmentsDetails {
    private List<AppointmentDetails> appointments = new ArrayList<>();

    public static AllAppointmentsDetails from(List<Appointment> appointments) {
        List<AppointmentDetails> appointmentDetailsList =
                appointments.stream().map(AppointmentDetails::from).collect(Collectors.toList());
        return new AllAppointmentsDetails(appointmentDetailsList);
    }
}
