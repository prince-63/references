package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    void deleteByAuthId(Long id);
}
