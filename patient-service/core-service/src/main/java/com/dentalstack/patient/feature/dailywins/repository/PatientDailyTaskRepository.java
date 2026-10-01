package com.dentalstack.patient.feature.dailywins.repository;

import com.dentalstack.patient.feature.dailywins.entity.DailyWins;
import com.dentalstack.patient.feature.dailywins.entity.PatientDailyWins;
import com.dentalstack.patient.feature.patient.entity.Patient;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientDailyTaskRepository extends JpaRepository<PatientDailyWins, Long> {

    Optional<PatientDailyWins> findByPatientAndDailyTaskAndTaskDate(
            Patient patient, DailyWins dailyTask, LocalDate taskDate);
}
