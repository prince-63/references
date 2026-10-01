package com.dentalstack.patient.feature.workflow.manufacturing_checklist.service;

import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.ManufacturingBatchCheckListRequestDTO;
import com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto.ManufacturingBatchCheckListResponseDTO;
import java.util.List;

public interface ManufacturingBatchCheckListService {

    void create(ManufacturingBatchCheckListRequestDTO request);

    void createMultiple(List<ManufacturingBatchCheckListRequestDTO> request);

    ManufacturingBatchCheckListResponseDTO update(Long id, ManufacturingBatchCheckListRequestDTO request);

    void delete(Long id);

    ManufacturingBatchCheckListResponseDTO getById(Long id);

    List<ManufacturingBatchCheckListResponseDTO> getByBatchId(Long batchId);
}
