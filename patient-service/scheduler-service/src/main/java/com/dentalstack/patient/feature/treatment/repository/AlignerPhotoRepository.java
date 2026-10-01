package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.treatment.entity.AlignerPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerPhotoRepository extends JpaRepository<AlignerPhoto, Long> {}
