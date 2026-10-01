package com.dentalstack.patient.feature.workflow.core.workflows.repository;

import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<WorkflowService, Long> {

    @Query(
            """
    SELECT s FROM WorkflowService s
    WHERE (:profileId IS NULL OR s.userProfile.id = :profileId)
      AND (:orgId IS NULL OR s.orgId = :orgId)
      AND (:subscriptionType IS NULL OR s.subscriptionType = :subscriptionType)
    """)
    Page<WorkflowService> findByFilters(
            @Param("profileId") Long profileId,
            @Param("orgId") Long orgId,
            @Param("subscriptionType") String subscriptionType,
            Pageable pageable);
}
