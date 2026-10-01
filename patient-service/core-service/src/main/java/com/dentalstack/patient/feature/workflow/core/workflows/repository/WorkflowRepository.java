package com.dentalstack.patient.feature.workflow.core.workflows.repository;

import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {

    @Query("SELECT w FROM Workflow w WHERE " + "(:profileId IS NULL OR w.userProfile.id = :profileId) AND "
            + "(:orgId IS NULL OR w.orgId = :orgId) AND "
            + "(:orderType IS NULL OR w.orderType = :orderType) AND "
            + "(:archived IS NULL OR w.archived = :archived)")
    List<Workflow> findByFilters(
            @Param("profileId") Long profileId,
            @Param("orgId") Long orgId,
            @Param("orderType") String orderType,
            @Param("archived") Boolean archived);

    @Query("SELECT w FROM Workflow w " + "LEFT JOIN FETCH w.statuses "
            + "WHERE (:profileId IS NULL OR w.userProfile.id = :profileId) AND "
            + "(:orgId IS NULL OR w.orgId = :orgId) AND "
            + "(:orderType IS NULL OR w.orderType = :orderType) AND "
            + "(:workflowName IS NULL OR w.name = :workflowName)")
    List<Workflow> getKanbanBoardByFilters(
            @Param("profileId") Long profileId,
            @Param("orgId") Long orgId,
            @Param("orderType") String orderType,
            @Param("workflowName") String workflowName);

    @Query("SELECT w FROM Workflow w " + "JOIN FETCH w.userProfile up "
            + "WHERE w.name = :name "
            + "AND w.orderType = :orderType "
            + "AND up.id = :userId "
            + "AND w.systemDefined = true")
    Optional<Workflow> findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
            @Param("name") String name, @Param("orderType") String orderType, @Param("userId") Long userId);

    List<Workflow> findByIsDentalStackDefinedWorkflowTrue();

    @Query(
            "SELECT w.id FROM Workflow w WHERE w.name = :name AND w.systemDefined = true AND w.userProfile.id = :profileId")
    Optional<Long> findWorkflowIdByNameAndSystemDefinedAndProfileId(
            @Param("name") String name, @Param("profileId") Long profileId);
}
