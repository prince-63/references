package com.dentalstack.auth.repository;

import com.dentalstack.auth.entity.authstage.AuthStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthStageRepository extends JpaRepository<AuthStage, Long> {
    void deleteByAuthId(Long id);
}
