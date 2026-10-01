package com.dentalstack.auth.repository.organization;

import com.dentalstack.auth.entity.organization.SyncTracker;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncTrackerRepository extends JpaRepository<SyncTracker, Long> {
    Optional<SyncTracker> findByOrgName(String orgName);
}
