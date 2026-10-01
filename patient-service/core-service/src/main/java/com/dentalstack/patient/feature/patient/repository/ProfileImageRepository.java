package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.patient.entity.ProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileImageRepository extends JpaRepository<ProfileImage, Long> {}
