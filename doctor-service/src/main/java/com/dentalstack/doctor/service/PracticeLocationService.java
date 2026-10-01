package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.practicelocation.*;
import com.dentalstack.doctor.entity.PracticeLocation;
import jakarta.annotation.Nullable;
import java.util.List;

public interface PracticeLocationService {
    String addPracticeLocation(AddPracticeLocationRequest addPracticeLocationRequest);

    List<PracticeLocation> getPracticeLocation(@Nullable Long practiceLocationId, int page, int size);

    PracticeLocationAllResponse getAll(Long practiceLocationId, int page, int size, boolean fetchAll);

    PracticeLocationAllResponse getPracticeLocationsForDoctor(Long doctorId, int page, int size, boolean fetchAll);

    String assignPracticeLocationToPatient(
            AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest);

    void removePracticeLocationFromPatient(Long patientId);

    String updatePracticeLocation(UpdatePracticeLocationRequest updatePracticeLocationRequest);

    Long getActiveCount(Long doctorId);

    Long getAllCount(Long doctorId);

    List<PLOfPatientResponse> getPracticeLocationByList(List<Long> patientId);

    PracticeLocationAllResponse getPracticeLocationsForDoctor(PracticeLocationGetRequest request);

    PracticeLocationAllResponse getActiveLocationOfDoctor(Long doctorId, Long organizationId, Long profileId);

    PLOfPatientResponse getPracticeLocationByPatientId(Long patientId);

    List<PLOfPatientResponse> getPracticeLocationByListForFilter(List<Long> patientIds);
}
