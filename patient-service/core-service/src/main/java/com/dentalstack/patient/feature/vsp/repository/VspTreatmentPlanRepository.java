package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.entity.VspTreatmentPlan;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VspTreatmentPlanRepository extends JpaRepository<VspTreatmentPlan, Long> {

    List<VspTreatmentPlan> findAllByVspOrderIdOrderByPlanIndexDesc(String vspOrderId);

    List<VspTreatmentPlan> findAllByVspOrderIdAndStatus(Long vspOrderId, VspTreatmentPlanStatus status);

    @Query("SELECT COUNT(tp) FROM VspTreatmentPlan tp WHERE tp.vspOrder.id = ?1")
    Long countByOrderId(String orderId);
}
