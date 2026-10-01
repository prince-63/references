package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.dto.summary.VspProductionIdAndStatus;
import com.dentalstack.patient.feature.vsp.entity.VspProduction;
import com.dentalstack.patient.feature.vsp.enums.VspProductionStatus;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VspProductionRepository extends JpaRepository<VspProduction, String> {

    Optional<VspProduction> findByVspOrderId(String vspOrderId);

    @Query("SELECT p.status FROM VspProduction p WHERE p.vspOrder.id = :orderId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<VspProductionStatus> findLatestStatusByOrderId(@Param("orderId") String orderId);

    @Query(
            "SELECT p.id AS id, p.status AS status FROM VspProduction p WHERE p.vspOrder.id = :orderId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<VspProductionIdAndStatus> findLatestIdAndStatusByOrderId(@Param("orderId") String orderId);
}
