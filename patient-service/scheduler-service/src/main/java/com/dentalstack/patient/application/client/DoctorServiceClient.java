package com.dentalstack.patient.application.client;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "doctor-service", url = "${spring.cloud.openfeign.client.config.doctor-service.url}")
public interface DoctorServiceClient {

    @GetMapping("/doctor/v1/details")
    DoctorDetails getDoctorDetail(@RequestParam(value = "doctor_id") Long doctorId);
}
