package com.dentalstack.auth.repository.organization;

import com.dentalstack.auth.entity.organization.AuthOrganization;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthOrganizationRepository extends JpaRepository<AuthOrganization, Long> {
    Optional<AuthOrganization> findByName(String token);

    Optional<AuthOrganization> findByNameAndToken(String name, String token);

    boolean existsByNameAndToken(String name, String token);
}
