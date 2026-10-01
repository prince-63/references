package com.dentalstack.doctor.repository.gettingstarted;

import com.dentalstack.doctor.entity.gettingstarted.GettingStarted;
import com.dentalstack.doctor.enums.gettingstarted.GettingStartedEnum;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GettingStartedRepository extends JpaRepository<GettingStarted, Long> {
    Optional<GettingStarted> findByProfileIdAndOrganizationIdAndGettingStartedEnum(
            Long profileId, Long organizationId, GettingStartedEnum gettingStartedEnum);
}
