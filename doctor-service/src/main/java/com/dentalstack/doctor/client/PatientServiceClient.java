package com.dentalstack.doctor.client;

import com.dentalstack.doctor.dto.CreateCardDisplayConfigRequestDto;
import com.dentalstack.doctor.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.doctor.dto.dashboard.DashboardCounts;
import com.dentalstack.doctor.dto.subscription.Subscription;
import com.dentalstack.doctor.dto.timeline.AddEventRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "patient-service")
public interface PatientServiceClient {

    @GetMapping("/patient/doctor/dashboard/v1/get/count")
    DashboardCounts getCountsForDoctor(@RequestParam(value = "doctorId", required = false) Long doctorId);

    @PostMapping("/patient/timeline/v1/event")
    void addEvent(@RequestBody AddEventRequest request);

    @PostMapping("/patient/timeline/v1/without/patient/event")
    void addEventWithoutPatient(@RequestBody AddEventRequest request);

    @GetMapping("/patient/subscription/v1/details/{doctor_id}")
    List<Subscription> getSubscriptionDetails(@PathVariable("doctor_id") Long doctorId);

    @PostMapping("/patient/chargebee/v1/create/customer/subscription")
    void createCustomerAndAddBasicPlan(@RequestBody ChargebeeCreateCustomerRequest request);

    @PostMapping("/patient/cache/v1/{profile_id}")
    void clearDashboardCache(@PathVariable("profile_id") long profileId);

    @PostMapping("/patient/card-display-config/card-display-configs")
    void createCardDisplayConfig(@Valid @RequestBody CreateCardDisplayConfigRequestDto request);
}
