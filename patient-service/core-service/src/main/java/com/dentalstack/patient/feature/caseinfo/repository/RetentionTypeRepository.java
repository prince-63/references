package com.dentalstack.patient.feature.caseinfo.repository;

import com.dentalstack.patient.feature.caseinfo.entity.RetentionType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetentionTypeRepository extends JpaRepository<RetentionType, Long> {

    List<RetentionType> findByDoctorId(Long doctorId);

    List<RetentionType> findByIsCommonTrue();
}
