package com.dentalstack.patient.feature.dailywins.repository;

import com.dentalstack.patient.feature.dailywins.entity.DailyWins;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyTaskRepository extends JpaRepository<DailyWins, Long> {
    Optional<DailyWins> findByCode(String code);
}
