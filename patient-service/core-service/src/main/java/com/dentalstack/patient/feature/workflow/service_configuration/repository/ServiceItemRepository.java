package com.dentalstack.patient.feature.workflow.service_configuration.repository;

import com.dentalstack.patient.feature.workflow.service_configuration.entity.ServiceItem;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    boolean existsByItemName(String itemName);

    Optional<ServiceItem> findByItemName(String itemName);

    @Query("""
     SELECT si FROM ServiceItem si WHERE si.itemName IN (:itemNames)
    """)
    List<ServiceItem> findByItemNames(List<String> itemNames);

    Set<ServiceItem> findByIsActiveTrue();
}
