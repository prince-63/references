package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorPracticeLocationRepository extends JpaRepository<PracticeLocation, Long> {
    @Query(
            value =
                    """
                    SELECT * FROM
                        practice_location pl
                    WHERE
                        pl.doctor_id = :doctorId
                        AND pl.organization_id = :organizationId
                        AND (
                            CASE
                                WHEN pl.practice_location_name  ILIKE CONCAT('%', :query, '%') THEN 1
                                ELSE 0
                            END
                        ) > 0
                    ORDER BY
                        CASE
                            WHEN pl.practice_location_name ILIKE CONCAT('%', :query, '%') THEN 1
                            ELSE 2
                        end
                    """,
            nativeQuery = true)
    List<PracticeLocation> findByQueryAndDoctorId(String query, Long doctorId, Long organizationId);
}
