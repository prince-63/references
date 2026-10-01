package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.entity.VspProductionShipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VspProductionShippingRepository extends JpaRepository<VspProductionShipping, String> {}
