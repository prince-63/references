package com.dentalstack.patient.feature.workflow.manufacturing_checklist.repository;

import com.dentalstack.patient.feature.workflow.manufacturing_checklist.entity.ManufacturingBatchCheckList;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ManufacturingBatchCheckListRepository extends JpaRepository<ManufacturingBatchCheckList, Long> {

    @Query("SELECT m FROM ManufacturingBatchCheckList m WHERE m.manufacturingBatch.id = :manufacturingBatchId")
    List<ManufacturingBatchCheckList> findByManufacturingBatchId(
            @Param("manufacturingBatchId") Long manufacturingBatchId);

    void deleteAllByPatientId(Long patientId);
}
