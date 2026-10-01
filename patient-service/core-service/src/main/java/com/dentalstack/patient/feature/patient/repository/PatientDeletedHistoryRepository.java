package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.patient.entity.PatientDeletedHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientDeletedHistoryRepository extends JpaRepository<PatientDeletedHistory, Long> {}
