package com.dentalstack.doctor.dto.doctor;

import com.dentalstack.doctor.entity.Doctor;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorPatientDetails {

    private DoctorDetails doctorDetails;
    private List<Long> patientIds;

    public static DoctorPatientDetails from(Doctor doctor, List<Long> patientIds) {
        DoctorDetails doctorDetails = DoctorDetails.from(doctor);
        return new DoctorPatientDetails(doctorDetails, patientIds);
    }
}
