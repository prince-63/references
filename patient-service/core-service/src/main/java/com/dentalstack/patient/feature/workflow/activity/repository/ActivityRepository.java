package com.dentalstack.patient.feature.workflow.activity.repository;

import com.dentalstack.patient.feature.workflow.activity.entity.ActivityLog;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<ActivityLog, Long> {

    void deleteAllByPatientId(Long patientId);

    @Query(
            value = "SELECT a.id FROM ActivityLog a"
                    + " WHERE a.patient.id = :patientId"
                    + " AND ("
                    + "   a.visibilityScope = 'ALL'"
                    + "   OR (a.visibilityScope = 'CREATOR_ONLY' AND a.activityBy.id = :profileId)"
                    + "   OR (a.visibilityScope = 'SPECIFIC' AND a.id IN ("
                    + "     SELECT a2.id FROM ActivityLog a2 JOIN a2.visibleToProfiles vtp WHERE vtp.id = :profileId"
                    + "   ))"
                    + " )"
                    + " ORDER BY a.activityAt DESC",
            countQuery = "SELECT COUNT(a.id) FROM ActivityLog a"
                    + " WHERE a.patient.id = :patientId"
                    + " AND ("
                    + "   a.visibilityScope = 'ALL'"
                    + "   OR (a.visibilityScope = 'CREATOR_ONLY' AND a.activityBy.id = :profileId)"
                    + "   OR (a.visibilityScope = 'SPECIFIC' AND a.id IN ("
                    + "     SELECT a2.id FROM ActivityLog a2 JOIN a2.visibleToProfiles vtp WHERE vtp.id = :profileId"
                    + "   ))"
                    + " )")
    Page<Long> findActivityIdsWithScopes(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId, Pageable pageable);

    @Query(
            """
        SELECT DISTINCT a FROM ActivityLog a
        LEFT JOIN FETCH a.activityBy ab
        LEFT JOIN FETCH ab.user u
        LEFT JOIN FETCH a.patient p
        WHERE a.id IN :ids
        ORDER BY a.activityAt DESC
    """)
    List<ActivityLog> findAllActivityByIdsWithRelations(@Param("ids") List<Long> ids);

    @Query(
            value = "SELECT a.id FROM ActivityLog a"
                    + " WHERE a.patient.id = :patientId"
                    + " AND a.activityType NOT IN ('MOVE', 'CHANGE_WORKFLOW')"
                    + " AND ("
                    + "   a.visibilityScope = 'ALL'"
                    + "   OR (a.visibilityScope = 'CREATOR_ONLY' AND a.activityBy.id = :profileId)"
                    + "   OR (a.visibilityScope = 'SPECIFIC' AND a.id IN ("
                    + "     SELECT a2.id FROM ActivityLog a2 JOIN a2.visibleToProfiles vtp WHERE vtp.id = :profileId"
                    + "   ))"
                    + " )"
                    + " ORDER BY a.activityAt DESC",
            countQuery = "SELECT COUNT(a.id) FROM ActivityLog a"
                    + " WHERE a.patient.id = :patientId"
                    + " AND a.activityType NOT IN ('MOVE', 'CHANGE_WORKFLOW')"
                    + " AND ("
                    + "   a.visibilityScope = 'ALL'"
                    + "   OR (a.visibilityScope = 'CREATOR_ONLY' AND a.activityBy.id = :profileId)"
                    + "   OR (a.visibilityScope = 'SPECIFIC' AND a.id IN ("
                    + "     SELECT a2.id FROM ActivityLog a2 JOIN a2.visibleToProfiles vtp WHERE vtp.id = :profileId"
                    + "   ))"
                    + " )")
    Page<Long> findActivityIdsWithScopesExcludingMoveAndChangeWorkflow(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId, Pageable pageable);

    boolean existsByPatient_IdAndActivityType(Long patientId, ActivityType activityType);
}
