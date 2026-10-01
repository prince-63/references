package com.dentalstack.patient.feature.storage.files.repository;

import com.dentalstack.patient.global.entity.DraftFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DraftFileRepository extends JpaRepository<DraftFile, Long> {}
