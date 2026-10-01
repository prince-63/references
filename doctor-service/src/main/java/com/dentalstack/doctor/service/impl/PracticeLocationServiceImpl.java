package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.dto.practicelocation.*;
import com.dentalstack.doctor.entity.*;
import com.dentalstack.doctor.exception.doctor.DoctorNotFoundException;
import com.dentalstack.doctor.exception.doctor.ErrorCode;
import com.dentalstack.doctor.exception.doctor.InvalidRequestException;
import com.dentalstack.doctor.exception.practicelocation.PracticeLocationNotFoundException;
import com.dentalstack.doctor.mapper.PracticeLocationMapper;
import com.dentalstack.doctor.repository.*;
import com.dentalstack.doctor.repository.user.UserProfileRepository;
import com.dentalstack.doctor.service.PracticeLocationService;
import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PracticeLocationServiceImpl implements PracticeLocationService {

    private final PracticeLocationRepository practiceLocationRepository;

    private final DoctorRepository doctorRepository;

    private final DoctorPracticeLocationRepository doctorPracticeLocationRepository;

    private final PatientPracticeLocationRepository patientPracticeLocationRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public String addPracticeLocation(AddPracticeLocationRequest request) {
        Doctor doctor = doctorRepository
                .findByIdAndActiveTrue(request.getDoctorId())
                .orElseThrow(() -> new InvalidRequestException(
                        ErrorCode.BAD_REQUEST, "Doctor not found with this id: " + request.getDoctorId()));

        String practiceLocationName = request.getPracticeLocationName();

        // Check if clinic or address already exists
        List<PracticeLocation> optionalPracticeLocationList =
                practiceLocationRepository.findByPracticeLocationNameAndDoctorIdAndUserProfileIdAndActiveTrueAndAddress(
                        practiceLocationName, request.getDoctorId(), request.getProfileId(), request.getAddress());

        for (PracticeLocation practiceLoc : optionalPracticeLocationList) {
            if (practiceLoc.getPracticeLocationName().equals(request.getPracticeLocationName())) {
                throw new InvalidRequestException(
                        ErrorCode.DUPLICATE_PRACTICE_LOCATION,
                        "Clinic name already exists: " + request.getPracticeLocationName());
            }

            if (practiceLoc.getAddress().equals(request.getAddress())) {
                throw new InvalidRequestException(
                        ErrorCode.DUPLICATE_ADDRESS, "Clinic with the same address already exists");
            }
        }

        // Count the number of practice locations for this doctor
        long practiceLocationCount = practiceLocationRepository.countByDoctorIdAndActiveTrue(request.getDoctorId());

        // Set the practice location type based on the count
        String practiceLocationType = (practiceLocationCount == 0) ? "Primary" : "Secondary";

        var userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        // If checks pass, proceed to save the practice location
        PracticeLocation practiceLocation = PracticeLocationMapper.fromAddRequest(request, userProfile);
        practiceLocation.setPracticeLocationType(practiceLocationType);
        practiceLocation = practiceLocationRepository.save(practiceLocation);

        DoctorPracticeLocation doctorPracticeLocation = new DoctorPracticeLocation();
        doctorPracticeLocation.setActive(true);
        doctorPracticeLocation.setCreatedByDoctorId(request.getDoctorId());
        doctorPracticeLocation.setDoctor(doctor);
        doctorPracticeLocation.setPracticeLocation(practiceLocation);
        doctorPracticeLocationRepository.save(doctorPracticeLocation);

        return "success";
    }

    @Override
    public List<PracticeLocation> getPracticeLocation(@Nullable Long practiceLocationId, int page, int size) {
        List<PracticeLocation> practiceLocations = new ArrayList<>();
        if (practiceLocationId != null) {
            PracticeLocation practiceLocation = practiceLocationRepository
                    .findById(practiceLocationId)
                    .orElseThrow(() -> new PracticeLocationNotFoundException(practiceLocationId));
            practiceLocations.add(practiceLocation);
        } else {
            Page<PracticeLocation> practiceLocationPage =
                    practiceLocationRepository.findAll(PageRequest.of(page, size));
            practiceLocations.addAll(practiceLocationPage.getContent());
        }
        return practiceLocations;
    }

    public PracticeLocationAllResponse getAll(Long practiceLocationId, int page, int size, boolean fetchAll) {
        if (fetchAll) {
            List<PracticeLocation> allPracticeLocations = practiceLocationRepository.findAll();
            return PracticeLocationAllResponse.from(allPracticeLocations);
        } else {
            Pageable pageable = PageRequest.of(page, size);
            Page<PracticeLocation> practiceLocationPage = practiceLocationRepository.findAll(pageable);
            List<PracticeLocation> paginatedPracticeLocations = practiceLocationPage.getContent();
            return PracticeLocationAllResponse.fromPaginated(
                    paginatedPracticeLocations, practiceLocationPage.getTotalElements());
        }
    }

    @Override
    @Deprecated
    public PracticeLocationAllResponse getPracticeLocationsForDoctor(
            Long doctorId, int page, int size, boolean fetchAll) {
        List<PracticeLocation> practiceLocations;

        practiceLocations = practiceLocationRepository.findByDoctorId(doctorId);
        practiceLocations.sort(Comparator.comparing(PracticeLocation::getPracticeLocationName));
        return PracticeLocationAllResponse.from(practiceLocations);
    }

    @Override
    public PracticeLocationAllResponse getPracticeLocationsForDoctor(PracticeLocationGetRequest request) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }
        List<PracticeLocation> practiceLocations = practiceLocationRepository.findByDoctorIdAndProfileAndOrg(
                request.getDoctorId(), request.getProfileId(), request.getOrganizationId());
        return PracticeLocationAllResponse.from(practiceLocations);
    }

    @Override
    public PracticeLocationAllResponse getActiveLocationOfDoctor(Long doctorId, Long organizationId, Long profileId) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);
        Long finalProfileId = profileId;
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(finalProfileId));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            profileId = userProfile.getId();
            doctorId = userProfile.getDoctor().getId();
            organizationId = userProfile.getOrganization().getId();
        }
        List<PracticeLocation> practiceLocations;
        practiceLocations = practiceLocationRepository.findByDoctorIdAndProfileAndOrgWithActive(
                doctorId, profileId, organizationId);
        return PracticeLocationAllResponse.from(practiceLocations);
    }

    @Override
    public String assignPracticeLocationToPatient(
            @Valid AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest) {

        Optional<PatientPracticeLocation> optional = patientPracticeLocationRepository.findByPatientIdAndActiveTrue(
                assignPracticeLocationToPatientRequest.getPatientId());

        Optional<PracticeLocation> practiceLocation =
                practiceLocationRepository.findById(assignPracticeLocationToPatientRequest.getPracticeLocationId());
        if (practiceLocation.isEmpty()) {
            throw new InvalidRequestException(
                    ErrorCode.BAD_REQUEST,
                    "practice location is not present "
                            + assignPracticeLocationToPatientRequest.getPracticeLocationId());
        }
        if (optional.isPresent()) {
            PatientPracticeLocation patientPracticeLocation = optional.get();

            patientPracticeLocation.setUpdatedByDoctorId(assignPracticeLocationToPatientRequest.getUserId());
            patientPracticeLocation.setActive(false);
            patientPracticeLocation.setUpdatedAt(LocalDateTime.now());
            patientPracticeLocation.setPatientId(assignPracticeLocationToPatientRequest.getPatientId());

            patientPracticeLocationRepository.save(patientPracticeLocation);
        }

        PatientPracticeLocation patientPracticeLocation = new PatientPracticeLocation();
        patientPracticeLocation.setActive(true);
        patientPracticeLocation.setCreatedBy(assignPracticeLocationToPatientRequest.getUserId());
        patientPracticeLocation.setPatientId(assignPracticeLocationToPatientRequest.getPatientId());
        patientPracticeLocation.setPracticeLocation(practiceLocation.get());
        //        patientPracticeLocation.setTreatmentType(treatmentType.get());

        patientPracticeLocationRepository.save(patientPracticeLocation);

        return "Practice location assigned to patient successfully.";
    }

    @Override
    public void removePracticeLocationFromPatient(Long patientId) {
        List<PatientPracticeLocation> practiceLocations = patientPracticeLocationRepository.findByPatientId(patientId);
        if (!practiceLocations.isEmpty()) {
            patientPracticeLocationRepository.deleteAll(practiceLocations);
        }
    }

    @Transactional
    @Override
    public String updatePracticeLocation(@Valid UpdatePracticeLocationRequest request) {
        PracticeLocation practiceLocation = practiceLocationRepository
                .findById(request.getPracticeLocationId())
                .orElseThrow(() -> new InvalidRequestException(
                        ErrorCode.BAD_REQUEST,
                        "Practice location not found with id " + request.getPracticeLocationId()));

        validatePracticeLocationNameAndAddress(request, practiceLocation);
        validateMobileNumber(request, practiceLocation);
        handlePrimaryPracticeLocation(request);

        PracticeLocation updatedPracticeLocation = PracticeLocationMapper.updateFromRequest(practiceLocation, request);
        practiceLocationRepository.save(updatedPracticeLocation);

        return "True";
    }

    private void validatePracticeLocationNameAndAddress(
            UpdatePracticeLocationRequest request, PracticeLocation currentLocation) {
        List<PracticeLocation> existingLocations =
                practiceLocationRepository.findByPracticeLocationNameAndDoctorIdAndUserProfileIdAndAddress(
                        request.getPracticeLocationName(),
                        request.getDoctorId(),
                        request.getProfileId(),
                        request.getAddress());

        boolean hasDuplicate = existingLocations.stream()
                .anyMatch(loc -> !loc.getId().equals(request.getPracticeLocationId())
                        && (loc.getPracticeLocationName().equalsIgnoreCase(request.getPracticeLocationName())
                                || loc.getAddress().equalsIgnoreCase(request.getAddress())));

        if (hasDuplicate) {
            throw new InvalidRequestException(
                    ErrorCode.BAD_REQUEST, "Clinic name or address already exists for this doctor");
        }
    }

    private void validateMobileNumber(UpdatePracticeLocationRequest request, PracticeLocation currentLocation) {
        if (StringUtils.isNotBlank(request.getMobileNumber())
                && !request.getMobileNumber().equals(currentLocation.getMobileNumber())) {
            boolean mobileNumberExists =
                    practiceLocationRepository.findByMobileNumberAndActiveTrue(request.getMobileNumber()).stream()
                            .anyMatch(loc -> !Objects.equals(loc.getDoctorId(), request.getDoctorId()));

            if (mobileNumberExists) {
                throw new InvalidRequestException(
                        ErrorCode.BAD_REQUEST, request.getMobileNumber() + " Mobile number already exists");
            }
        }
    }

    private void handlePrimaryPracticeLocation(UpdatePracticeLocationRequest request) {
        if ("Primary".equalsIgnoreCase(request.getPracticeLocationType())) {
            practiceLocationRepository
                    .findByDoctorIdAndPracticeLocationTypeAndActiveTrue(request.getDoctorId(), "Primary")
                    .ifPresent(loc -> {
                        loc.setPracticeLocationType("Secondary");
                        practiceLocationRepository.save(loc);
                    });
        }
    }

    @Override
    public Long getActiveCount(Long doctorId) {
        // Count the number of practice locations for this doctor
        return practiceLocationRepository.countByDoctorIdAndActiveTrue(doctorId);
    }

    @Override
    public Long getAllCount(Long doctorId) {
        // Count the number of practice locations for this doctor
        return practiceLocationRepository.countByDoctorId(doctorId);
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationByList(List<Long> patientIds) {
        // Single batch query replaces 2*N queries (was N+1 pattern)
        Map<Long, PatientPracticeLocation> mappingByPatient =
                patientPracticeLocationRepository.findActiveByPatientIds(patientIds).stream()
                        .collect(java.util.stream.Collectors.toMap(
                                PatientPracticeLocation::getPatientId,
                                ppl -> ppl,
                                (a, b) -> a)); // keep first if duplicates

        List<PLOfPatientResponse> responseList = new ArrayList<>();
        for (Long patientId : patientIds) {
            PatientPracticeLocation ppl = mappingByPatient.get(patientId);
            PLOfPatientResponse response = new PLOfPatientResponse();
            response.setPatientId(patientId);

            if (ppl != null
                    && ppl.getPracticeLocation() != null
                    && ppl.getPracticeLocation().getId() != null) {
                response.setPracticeLocationName(ppl.getPracticeLocation().getPracticeLocationName());
            } else {
                response.setPracticeLocationName("N/A");
            }
            responseList.add(response);
        }
        return responseList;
    }

    @Override
    public PLOfPatientResponse getPracticeLocationByPatientId(Long patientId) {
        Optional<PatientPracticeLocation> patientPracticeLocation =
                patientPracticeLocationRepository.findByPatientIdAndActiveTrue(patientId);
        if (patientPracticeLocation.isPresent()) {

            if (patientPracticeLocation.get().getPracticeLocation() != null
                    && patientPracticeLocation.get().getPracticeLocation().getId() != null) {
                Optional<PracticeLocation> practiceLocation = practiceLocationRepository.findById(
                        patientPracticeLocation.get().getPracticeLocation().getId());

                if (practiceLocation.isPresent()) {
                    PLOfPatientResponse pLOfPatientResponse = new PLOfPatientResponse();
                    pLOfPatientResponse.setPatientId(patientId);
                    pLOfPatientResponse.setPracticeLocationName(
                            practiceLocation.get().getPracticeLocationName());
                    pLOfPatientResponse.setPracticeLocationId(
                            practiceLocation.get().getId());
                    return pLOfPatientResponse;

                } else {
                    PLOfPatientResponse pLOfPatientResponse = new PLOfPatientResponse();
                    pLOfPatientResponse.setPatientId(patientId);
                    pLOfPatientResponse.setPracticeLocationName("N/A");
                    return pLOfPatientResponse;
                }
            } else {
                PLOfPatientResponse pLOfPatientResponse = new PLOfPatientResponse();
                pLOfPatientResponse.setPatientId(patientId);
                pLOfPatientResponse.setPracticeLocationName("N/A");
                return pLOfPatientResponse;
            }
        } else {
            PLOfPatientResponse pLOfPatientResponse = new PLOfPatientResponse();
            pLOfPatientResponse.setPatientId(patientId);
            pLOfPatientResponse.setPracticeLocationName("N/A");
            return pLOfPatientResponse;
        }
    }

    @Override
    public List<PLOfPatientResponse> getPracticeLocationByListForFilter(List<Long> patientIds) {
        // Single batch query replaces 2*N queries (was N+1 pattern)
        Map<Long, PatientPracticeLocation> mappingByPatient =
                patientPracticeLocationRepository.findActiveByPatientIds(patientIds).stream()
                        .collect(java.util.stream.Collectors.toMap(
                                PatientPracticeLocation::getPatientId, ppl -> ppl, (a, b) -> a));

        List<PLOfPatientResponse> responseList = new ArrayList<>();
        for (Long patientId : patientIds) {
            PatientPracticeLocation ppl = mappingByPatient.get(patientId);
            PLOfPatientResponse response = new PLOfPatientResponse();
            // Note: filter variant intentionally omits patientId on N/A entries (preserving original behaviour)
            if (ppl != null
                    && ppl.getPracticeLocation() != null
                    && ppl.getPracticeLocation().getId() != null) {
                response.setPatientId(patientId);
                response.setPracticeLocationName(ppl.getPracticeLocation().getPracticeLocationName());
            } else {
                response.setPracticeLocationName("N/A");
            }
            responseList.add(response);
        }
        return responseList;
    }
}
