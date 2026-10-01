package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.CustomerAccessAndRevoke;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerAccessAndRevokeRepository extends JpaRepository<CustomerAccessAndRevoke, Long> {

    @Query(
            """
    SELECT c FROM CustomerAccessAndRevoke c
    WHERE c.userProfile.id = :profileId
        AND c.organization.id = :organizationId
    """)
    Optional<CustomerAccessAndRevoke> findByProfileIdAndOrganizationId(
            @Param("profileId") Long profileId, @Param("organizationId") Long organizationId);
}
