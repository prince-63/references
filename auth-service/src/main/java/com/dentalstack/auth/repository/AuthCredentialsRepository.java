package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.credentials.AuthCredentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthCredentialsRepository extends JpaRepository<AuthCredentials, Long> {
    void deleteByAuthId(Long id);
}
