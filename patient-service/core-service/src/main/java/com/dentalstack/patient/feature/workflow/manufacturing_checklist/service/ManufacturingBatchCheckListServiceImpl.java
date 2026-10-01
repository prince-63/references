package com.dentalstack.patient.feature.workflow.manufacturing_checklist.service;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.ManufacturingBatchCheckListRequestDTO;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.ManufacturingBatchCheckListResponseDTO;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.entity.ManufacturingBatchCheckList;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.repository.ManufacturingBatchCheckListRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ManufacturingBatchCheckListServiceImpl implements ManufacturingBatchCheckListService {

    private final ManufacturingBatchCheckListRepository checkListRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository profileRepository;
    private final ManufacturingRepository manufacturingRepository;

    @Override
    public void create(ManufacturingBatchCheckListRequestDTO request) {
        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found"));

        UserProfile profile = profileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new NotFoundException("UserProfile not found"));

        ManufacturingBatch manufacturingBatch = manufacturingRepository
                .getManufacturingById(request.getManufacturingBatchId())
                .orElseThrow(() -> new NotFoundException("UserProfile not found"));

        ManufacturingBatchCheckList checkList = ManufacturingBatchCheckList.builder()
                .patient(patient)
                .addedBy(profile)
                .manufacturingBatch(manufacturingBatch)
                .title(request.getTitle())
                .checked(request.getChecked())
                .build();

        checkListRepository.save(checkList);
    }

    @Override
    public void createMultiple(List<ManufacturingBatchCheckListRequestDTO> request) {
        for (ManufacturingBatchCheckListRequestDTO checkListDetails : request) {
            create(checkListDetails);
        }
    }

    @Override
    public ManufacturingBatchCheckListResponseDTO update(Long id, ManufacturingBatchCheckListRequestDTO request) {
        ManufacturingBatchCheckList existing =
                checkListRepository.findById(id).orElseThrow(() -> new RuntimeException("Checklist not found"));

        existing.setTitle(request.getTitle());
        existing.setChecked(request.getChecked());

        ManufacturingBatchCheckList updated = checkListRepository.save(existing);

        return ManufacturingBatchCheckListResponseDTO.mapToResponse(updated);
    }

    @Override
    public void delete(Long id) {
        checkListRepository.deleteById(id);
    }

    @Override
    public ManufacturingBatchCheckListResponseDTO getById(Long id) {
        ManufacturingBatchCheckList entity =
                checkListRepository.findById(id).orElseThrow(() -> new NotFoundException("Checklist not found"));
        return ManufacturingBatchCheckListResponseDTO.mapToResponse(entity);
    }

    @Override
    public List<ManufacturingBatchCheckListResponseDTO> getByBatchId(Long batchId) {
        List<ManufacturingBatchCheckList> checkLists = checkListRepository.findByManufacturingBatchId(batchId);
        return checkLists.stream()
                .map(ManufacturingBatchCheckListResponseDTO::mapToResponse)
                .collect(Collectors.toList());
    }
}
