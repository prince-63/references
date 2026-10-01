package com.dentalstack.patient.feature.caseinfo.repository;

import com.dentalstack.patient.feature.caseinfo.entity.AnchorType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnchorTypeRepository extends JpaRepository<AnchorType, Long> {

    List<AnchorType> findByDoctorId(Long doctorId);

    List<AnchorType> findByIsCommonTrue();
}
