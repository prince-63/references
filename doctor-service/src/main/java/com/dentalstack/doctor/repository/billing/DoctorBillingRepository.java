package com.dentalstack.doctor.repository.billing;

import com.dentalstack.doctor.entity.billing.DoctorBilling;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorBillingRepository extends JpaRepository<DoctorBilling, Long> {
    @Query(
            """
    SELECT CASE
        WHEN COUNT(db) > 0 THEN true
        ELSE false
    END
    FROM DoctorBilling db
    JOIN db.userProfile up
    WHERE up.id = :profileId
""")
    boolean existsBillingByProfileId(@Param("profileId") Long profileId);
}
