package com.dentalstack.patient.feature.app_dentals.repository;

import com.dentalstack.patient.feature.app_dentals.entity.AppDetails;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppDetailsRepository extends JpaRepository<AppDetails, Long> {

    Optional<AppDetails> findByAppName(String appName);
}
