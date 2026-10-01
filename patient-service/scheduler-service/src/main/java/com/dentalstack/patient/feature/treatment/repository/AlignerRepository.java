package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.treatment.entity.Aligner;
import feign.Param;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerRepository extends JpaRepository<Aligner, Long> {
    @Query("SELECT a FROM Aligner a " + "WHERE a.startDate <= :currentDate "
            + "AND a.alignerJourney.progressStatus = 'NOT_STARTED'")
    Page<Aligner> findByProductionStatusAndStartDateLessThanEqual(
            @Param("currentDate") LocalDate currentDate, Pageable pageable);
}
