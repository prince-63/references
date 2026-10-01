package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.DailyAlignerWearTime;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DailyAlignerWearTimeRepository extends JpaRepository<DailyAlignerWearTime, Long> {
    @Query(
            """
        SELECT dwt FROM DailyAlignerWearTime dwt
        JOIN dwt.aligner a
        JOIN a.alignerJourney aj
        WHERE aj.patient.id = :patientId
        ORDER BY dwt.date DESC
        """)
    Page<DailyAlignerWearTime> findDailyWearTimeLogsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query(
            """
        SELECT dwt FROM DailyAlignerWearTime dwt
        JOIN dwt.aligner a
        JOIN a.alignerJourney aj
        WHERE aj.patient.id = :patientId
        AND dwt.date >= :fromDate AND dwt.date <= :toDate
        ORDER BY dwt.date DESC
        """)
    Page<DailyAlignerWearTime> findDailyWearTimeLogsByPatientIdAndDateRange(
            @Param("patientId") Long patientId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    @Query(
            """
SELECT d FROM DailyAlignerWearTime d
JOIN FETCH d.aligner a
JOIN FETCH a.alignerJourney aj
WHERE aj.patient.id = :patientId
AND a.srNo BETWEEN aj.startAlignerNo AND aj.currentAlignerNo
""")
    List<DailyAlignerWearTime> findWearTimesForActiveAligners(@Param("patientId") Long patientId);
}
