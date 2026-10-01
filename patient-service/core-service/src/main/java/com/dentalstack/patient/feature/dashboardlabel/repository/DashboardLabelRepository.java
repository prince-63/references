package com.dentalstack.patient.feature.dashboardlabel.repository;

import com.dentalstack.patient.feature.dashboardlabel.entity.DashboardLabels;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardLabelRepository extends JpaRepository<DashboardLabels, Long> {
    Optional<DashboardLabels> findByProfileId(long profileId);
}
