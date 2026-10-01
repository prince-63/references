package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.order.entity.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByDoctorIdAndProfileIdAndOrganizationId(Long doctorId, Long profileId, Long organizationId);
}
