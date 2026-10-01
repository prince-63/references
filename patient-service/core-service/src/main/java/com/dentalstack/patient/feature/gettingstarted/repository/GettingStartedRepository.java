package com.dentalstack.patient.feature.gettingstarted.repository;

import com.dentalstack.patient.feature.gettingstarted.entity.GettingStarted;
import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedEnum;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GettingStartedRepository extends JpaRepository<GettingStarted, Long> {
    Optional<GettingStarted> findByProfileIdAndOrganizationIdAndGettingStartedEnum(
            Long profileId, Long organizationId, GettingStartedEnum gettingStartedEnum);

    List<GettingStarted> findByProfileIdAndOrganizationIdAndDoctorId(
            Long profileId, Long organizationId, Long doctorId);
}
