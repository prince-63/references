package com.dentalstack.patient.feature.workflow.core.task_tracker.repository;

import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.CancelledPatientTaskTrackerProjection;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.PatientTaskTrackerProjection;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PatientTaskTrackerRepository extends JpaRepository<PatientTaskTracker, Long> {

    @Query("SELECT p FROM PatientTaskTracker p " + "LEFT JOIN FETCH p.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH p.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "WHERE p.id = :taskId")
    PatientTaskTracker findByIdWithAssignee(@Param("taskId") Long taskId);

    @Query("SELECT ptt FROM PatientTaskTracker ptt "
            + "JOIN FETCH ptt.workflow w "
            + "LEFT JOIN FETCH w.userProfile wup "
            + "LEFT JOIN FETCH ptt.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH ptt.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "LEFT JOIN FETCH ptt.manufacturingBatch "
            + "LEFT JOIN FETCH ptt.currentWorkflowStatus "
            + "WHERE ptt.orgId = :orgId "
            + "AND (wup.id = :profileId OR a.id = :profileId) "
            + "AND (:workflowName IS NULL OR w.name = :workflowName) "
            + "AND (:orderType IS NULL OR w.orderType = :orderType) "
            + "AND ptt.isActive = true "
            + "ORDER BY ptt.sequenceNumber ASC, ptt.workflowPosition ASC")
    List<PatientTaskTracker> findByOrgIdAndProfileIdWithOptionalFilters(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("workflowName") String workflowName,
            @Param("orderType") String orderType);

    @Query("SELECT ptt FROM PatientTaskTracker ptt " + "JOIN FETCH ptt.workflow w "
            + "LEFT JOIN FETCH w.userProfile wup "
            + "JOIN FETCH ptt.patient p "
            + "LEFT JOIN FETCH ptt.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH ptt.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "LEFT JOIN FETCH ptt.createdForProfile cfp "
            + "LEFT JOIN FETCH cfp.user "
            + "LEFT JOIN FETCH ptt.currentWorkflowStatus "
            + "LEFT JOIN FETCH ptt.manufacturingBatch "
            + "LEFT JOIN FETCH ptt.parentTask "
            + "LEFT JOIN FETCH ptt.order o "
            + "LEFT JOIN FETCH o.parentOrder "
            + "LEFT JOIN FETCH ptt.serviceProduct sp "
            + "LEFT JOIN FETCH sp.productCategory "
            + "WHERE ptt.orgId = :orgId "
            + "AND (wup.id = :profileId OR a.id = :profileId) "
            + "AND p.id = :patientId "
            + "AND ptt.isActive = true "
            + "ORDER BY ptt.sequenceNumber ASC, ptt.workflowPosition ASC")
    List<PatientTaskTracker> findIndividualPatientTaskByProfileId(
            @Param("orgId") Long orgId, @Param("profileId") Long profileId, @Param("patientId") Long patientId);

    @Query("SELECT ptt FROM PatientTaskTracker ptt " + "JOIN FETCH ptt.workflow w "
            + "LEFT JOIN FETCH w.userProfile wup "
            + "JOIN FETCH ptt.patient p "
            + "LEFT JOIN FETCH ptt.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH ptt.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "LEFT JOIN FETCH ptt.createdForProfile cfp "
            + "LEFT JOIN FETCH cfp.user "
            + "LEFT JOIN FETCH ptt.currentWorkflowStatus "
            + "LEFT JOIN FETCH ptt.manufacturingBatch "
            + "LEFT JOIN FETCH ptt.serviceProduct sp "
            + "LEFT JOIN FETCH ptt.order o "
            + "LEFT JOIN FETCH o.parentOrder "
            + "LEFT JOIN FETCH ptt.parentTask "
            + "LEFT JOIN FETCH sp.productCategory "
            + "WHERE ptt.orgId = :orgId "
            + "AND (wup.id = :profileId OR a.id = :profileId) "
            + "AND p.id = :patientId "
            + "AND ptt.isActive = true "
            + "AND (:workflowName IS NULL OR w.name = :workflowName) "
            + "ORDER BY ptt.sequenceNumber ASC, ptt.workflowPosition ASC")
    List<PatientTaskTracker> findIndividualPatientTaskByProfileIdByWorkflowFilter(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("patientId") Long patientId,
            @Param("workflowName") String workflowName);

    @Query(
            value = "SELECT ptt.* FROM patient_task_tracker ptt " + "JOIN workflows w ON ptt.workflow_id = w.id "
                    + "JOIN workflow_status ws ON ptt.current_workflow_status_id = ws.id "
                    + "LEFT JOIN patient p ON ptt.patient_id = p.id "
                    + "LEFT JOIN patient_task_tracker parent_ptt ON ptt.parent_task_id = parent_ptt.id "
                    + "LEFT JOIN workflow_status parent_ws ON parent_ptt.current_workflow_status_id = parent_ws.id "
                    + "WHERE ptt.org_id = :orgId "
                    + "AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "AND (:workflowName IS NULL OR w.name = :workflowName) "
                    + "AND (:orderType IS NULL OR w.order_type = :orderType) "
                    + "AND ((:assigneeIds) IS NULL OR ptt.assignee_id IN (:assigneeIds)) "
                    + "AND (:productIds IS NULL OR ptt.service_product_id IN (:productIds)) "
                    + "AND (:labelName IS NULL OR ws.label_name = :labelName) "
                    + "AND (:search IS NULL OR :search = '' OR "
                    + "     lower(p.first_name) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(p.last_name) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(p.uuid) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(p.email) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))) "
                    + "AND (ptt.parent_task_id IS NULL OR lower(parent_ws.name) NOT IN ('cancelled')) "
                    + "AND ptt.is_archived != true ",
            nativeQuery = true)
    List<PatientTaskTracker> findOngoingProductFilters(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("workflowName") String workflowName,
            @Param("orderType") String orderType,
            @Param("productIds") List<Long> productIds,
            @Param("assigneeIds") List<Long> assigneeIds,
            @Param("labelName") String labelName,
            @Param("search") String search,
            Pageable pageable);

    @Query(
            value = "SELECT ws.label_name AS labelName, "
                    + "       COUNT(filtered_ptt.id) AS count, "
                    + "       SUM(COUNT(filtered_ptt.id)) OVER () AS totalCount "
                    + "FROM workflow_status ws "
                    + "JOIN workflows w ON ws.workflow_id = w.id "
                    + "    AND w.profile_id = :profileId "
                    + "    AND (:workflowName IS NULL OR w.name = :workflowName) "
                    + "    AND (:orderType IS NULL OR w.order_type = :orderType) "
                    + "LEFT JOIN ("
                    + "    SELECT ptt.* "
                    + "    FROM patient_task_tracker ptt "
                    + "    LEFT JOIN patient_task_tracker parent_ptt ON ptt.parent_task_id = parent_ptt.id "
                    + "    LEFT JOIN workflow_status parent_ws ON parent_ptt.current_workflow_status_id = parent_ws.id "
                    + "    LEFT JOIN patient p ON ptt.patient_id = p.id "
                    + "    WHERE ptt.org_id = :orgId "
                    + "    AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "    AND (:productIds IS NULL OR ptt.service_product_id IN (:productIds)) "
                    + "    AND ((:assigneeIds) IS NULL OR ptt.assignee_id IN (:assigneeIds)) "
                    + "    AND (ptt.parent_task_id IS NULL OR lower(parent_ws.name) NOT IN ('cancelled')) "
                    + "    AND (:search IS NULL OR :search = '' OR "
                    + "         lower(p.first_name) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.last_name) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.uuid) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.email) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))) "
                    + ") filtered_ptt ON filtered_ptt.current_workflow_status_id = ws.id "
                    + "    AND filtered_ptt.workflow_id = w.id "
                    + "WHERE ws.label_name IS NOT NULL "
                    + "GROUP BY ws.label_name "
                    + "ORDER BY count DESC, ws.label_name ASC",
            nativeQuery = true)
    List<LabelCountProjection> findOngoingProductLabelCountsFilters(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("workflowName") String workflowName,
            @Param("orderType") String orderType,
            @Param("productIds") List<Long> productIds,
            @Param("assigneeIds") List<Long> assigneeIds,
            @Param("search") String search);

    @Query(
            value = "SELECT distinct_labels.label_name AS labelName, "
                    + "       COUNT(filtered_tasks.id) AS count, "
                    + "       SUM(COUNT(filtered_tasks.id)) OVER () AS totalCount "
                    + "FROM ("
                    + "    SELECT DISTINCT ws.label_name "
                    + "    FROM workflow_status ws "
                    + "    JOIN workflows w ON ws.workflow_id = w.id "
                    + "    WHERE ((:orgProfileId IS NOT NULL AND w.profile_id = :orgProfileId) OR (:orgProfileId IS NULL AND w.profile_id = :profileId)) "
                    + "    AND (:workflowName IS NULL OR w.name = :workflowName) "
                    + "    AND (:orderType IS NULL OR w.order_type = :orderType) "
                    + "    AND ws.label_name IS NOT NULL"
                    + ") distinct_labels "
                    + "LEFT JOIN ("
                    + "    SELECT ws.label_name, ptt.id "
                    + "    FROM patient_task_tracker ptt "
                    + "    JOIN workflow_status ws ON ptt.current_workflow_status_id = ws.id "
                    + "    JOIN workflows w ON ptt.workflow_id = w.id "
                    + "    LEFT JOIN patient_task_tracker parent_ptt ON ptt.parent_task_id = parent_ptt.id "
                    + "    LEFT JOIN workflow_status parent_ws ON parent_ptt.current_workflow_status_id = parent_ws.id "
                    + "    LEFT JOIN patient p ON ptt.patient_id = p.id "
                    + "    WHERE ptt.org_id = :orgId "
                    + "    AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "    AND (:workflowName IS NULL OR w.name = :workflowName) "
                    + "    AND (:orderType IS NULL OR w.order_type = :orderType) "
                    + "    AND (:productIds IS NULL OR ptt.service_product_id IN (:productIds)) "
                    + "    AND ((:assigneeIds) IS NULL OR ptt.assignee_id IN (:assigneeIds)) "
                    + "    AND (ptt.parent_task_id IS NULL OR lower(parent_ws.name) NOT IN ('cancelled')) "
                    + "    AND (:search IS NULL OR :search = '' OR "
                    + "         lower(p.first_name) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.last_name) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.uuid) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.email) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%')))"
                    + ") filtered_tasks ON distinct_labels.label_name = filtered_tasks.label_name "
                    + "GROUP BY distinct_labels.label_name "
                    + "ORDER BY count DESC, distinct_labels.label_name ASC",
            nativeQuery = true)
    List<LabelCountProjection> findOngoingProductLabelCountsFiltersWithOrgProfileId(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("orgProfileId") Long orgProfileId,
            @Param("workflowName") String workflowName,
            @Param("orderType") String orderType,
            @Param("productIds") List<Long> productIds,
            @Param("assigneeIds") List<Long> assigneeIds,
            @Param("search") String search);

    @Query(
            value = "SELECT ws.label_name AS labelName, "
                    + "       COALESCE(COUNT(ptt.id), 0) AS count, "
                    + "       SUM(COALESCE(COUNT(ptt.id), 0)) OVER () AS totalCount "
                    + "FROM workflow_status ws "
                    + "JOIN workflows w ON ws.workflow_id = w.id "
                    + "    AND ((:orgProfileId IS NOT NULL AND w.profile_id = :orgProfileId) OR (:orgProfileId IS NULL AND w.profile_id = :profileId)) "
                    + "    AND (:workflowName IS NULL OR w.name = :workflowName) "
                    + "    AND (:orderType IS NULL OR w.order_type = :orderType) "
                    + "LEFT JOIN patient_task_tracker ptt ON ptt.current_workflow_status_id = ws.id "
                    + "    AND ptt.org_id = :orgId "
                    + "    AND ptt.is_archived = false "
                    + "    AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "    AND ptt.is_active = true "
                    + "    AND ptt.workflow_id = w.id "
                    + "    AND (:serviceProductId IS NULL OR ptt.service_product_id = :serviceProductId) "
                    + "    AND (:assigneeId IS NULL OR ptt.assignee_id = :assigneeId) "
                    + "LEFT JOIN patient p ON ptt.patient_id = p.id "
                    + "    AND (:search IS NULL OR :search = '' OR "
                    + "         lower(p.first_name) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.last_name) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.uuid) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(p.email) LIKE lower(concat('%', :search, '%')) "
                    + "         OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))) "
                    + "WHERE ws.label_name IS NOT NULL "
                    + "AND (:labelName IS NULL OR ws.label_name = :labelName) "
                    + "GROUP BY ws.label_name "
                    + "ORDER BY count DESC, ws.label_name ASC",
            nativeQuery = true)
    List<LabelCountProjection> findLabelCountsWithFilters(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("orgProfileId") Long orgProfileId,
            @Param("workflowName") String workflowName,
            @Param("orderType") String orderType,
            @Param("serviceProductId") Long serviceProductId,
            @Param("assigneeId") Long assigneeId,
            @Param("labelName") String labelName,
            @Param("search") String search);

    @Query(
            value = "SELECT COUNT(*) FROM patient_task_tracker ptt " + "JOIN workflows w ON ptt.workflow_id = w.id "
                    + "JOIN workflow_status ws ON ptt.current_workflow_status_id = ws.id "
                    + "LEFT JOIN patient p ON ptt.patient_id = p.id "
                    + "LEFT JOIN patient_task_tracker parent_ptt ON ptt.parent_task_id = parent_ptt.id "
                    + "LEFT JOIN workflow_status parent_ws ON parent_ptt.current_workflow_status_id = parent_ws.id "
                    + "WHERE ptt.org_id = :orgId "
                    + "AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "AND (:workflowName IS NULL OR w.name = :workflowName) "
                    + "AND (:orderType IS NULL OR w.order_type = :orderType) "
                    + "AND ((:assigneeIds) IS NULL OR ptt.assignee_id IN (:assigneeIds)) "
                    + "AND (:productIds IS NULL OR ptt.service_product_id IN (:productIds)) "
                    + "AND (:labelName IS NULL OR ws.label_name = :labelName) "
                    + "AND (:search IS NULL OR :search = '' OR "
                    + "     lower(p.first_name) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(p.last_name) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(p.uuid) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(p.email) LIKE lower(concat('%', :search, '%')) "
                    + "     OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))) "
                    + "AND (ptt.parent_task_id IS NULL OR lower(parent_ws.name) NOT IN ('cancelled')) "
                    + "AND ptt.is_archived != true ",
            nativeQuery = true)
    long countByOrgIdAndProfileIdWithOptionalFilters(
            @Param("orgId") Long orgId,
            @Param("profileId") Long profileId,
            @Param("workflowName") String workflowName,
            @Param("orderType") String orderType,
            @Param("productIds") List<Long> productIds,
            @Param("assigneeIds") List<Long> assigneeIds,
            @Param("labelName") String labelName,
            @Param("search") String search);

    @Query("SELECT p FROM PatientTaskTracker p " + "LEFT JOIN FETCH p.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH p.currentWorkflowStatus "
            + "LEFT JOIN FETCH p.patient "
            + "LEFT JOIN FETCH p.workflow "
            + "LEFT JOIN FETCH p.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "LEFT JOIN FETCH p.order o "
            + "WHERE p.id = :id")
    Optional<PatientTaskTracker> findByIdWithUserProfilesAndUsers(@Param("id") Long id);

    @Query("SELECT p FROM PatientTaskTracker p "
            + "LEFT JOIN FETCH p.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH p.currentWorkflowStatus "
            + "LEFT JOIN FETCH p.patient pat "
            + "LEFT JOIN FETCH pat.doctorOrganization pdo "
            + "LEFT JOIN FETCH p.workflow "
            + "LEFT JOIN FETCH p.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "LEFT JOIN FETCH p.order o "
            + "LEFT JOIN FETCH p.manufacturingBatch "
            + "WHERE p.id = :id")
    Optional<PatientTaskTracker> findByIdWithUserProfilesAndUsersWithPdo(@Param("id") Long id);

    @Query(
            value =
                    """
            SELECT
                t.id AS id,
                p.id AS patientId,
                CONCAT(p.first_name, ' ', p.last_name) AS patientName,
                t.org_id AS orgId,
                w.id AS workflowId,
                t.workflow_name AS workflowName,
                ws.id AS currentWorkflowStatusId,
                t.current_status_name AS currentStatusName,
                t.case_type as caseType,
                t.previous_workflow_status_id AS previousWorkflowStatusId,
                p.gender AS gender,
                p.customer_mapped_id AS customerMappedId,
                p.practice_location_name AS clinicName,
                p.age AS age,
                cbp_user.first_name AS createdByFirstName,
                cbp_user.last_name AS createdByLastName,
                cbp_user.salutation AS createdBySalutation,
                t.created_at AS createdOn,
                p.product_type_name AS product,
                assignee_user.salutation AS assigneeSalutation,
                assignee_user.first_name AS assigneeFirstName,
                assignee_user.last_name AS assigneeLastName,
                cf.id AS createdForProfileId,
                cf_user.first_name AS createdForProfileName,
                t.order_type AS orderType,
                t.priority_level AS priorityLevel,
                t.practice_name AS practiceName,
                t.labels AS labels,
                t.is_active AS isActive,
                t.is_archived AS isArchived,
                t.completion_date AS completionDate,
                t.estimated_completion_date AS estimatedCompletionDate,
                t.sequence_number AS sequenceNumber,
                t.workflow_position AS workflowPosition,
                t.manufacturing_batch_sequence_number AS manufacturingBatchSequenceNumber,
                parent.id AS parentTaskId,
                o.id AS orderId,
                mb.id AS manufacturingBatchId,
                mb.treatment_plan_id AS treatmentPlanId,
                t.task_type AS taskType,
                t.task_created_for AS taskCreatedFor,
                t.service_products #>> '{}' AS serviceProducts,
                p.next_follow_up AS followUpDate,
                (
                    SELECT COUNT(child.id)
                    FROM patient_task_tracker child
                    LEFT JOIN workflows child_w ON child.workflow_id = child_w.id
                    LEFT JOIN workflow_status child_ws ON child.current_workflow_status_id = child_ws.id
                    WHERE child.parent_task_id = t.id
                    AND child_w.name = 'ONGOING PRODUCT LIST'
                    AND child_ws.name = 'Packaged'
                ) AS packagedOngoingProductListCount,
                added_by_user.first_name AS patientAddedByFirstName,
                added_by_user.last_name AS patientAddedByLastName,
                added_by_user.salutation AS patientAddedBySalutation,
                customer_user.first_name AS patientCustomerFirstName,
                customer_user.last_name AS patientCustomerLastName,
                customer_user.salutation AS patientCustomerSalutation,
                customer_user_profile.id AS patientCustomerUserProfileId,
                t.task_order_type AS taskOrderType,
                sp.product_type AS productType,
                sp.product_name AS productName,
                sp.product_description AS productDescription,
                sp.product_image AS productImage,
                CASE
                   WHEN o.parent_order_id IS NOT NULL THEN true
                     ELSE false
                   END AS isCloned
            FROM patient_task_tracker t
                LEFT JOIN patient p ON t.patient_id = p.id
                LEFT JOIN workflows w ON t.workflow_id = w.id
                LEFT JOIN workflow_status ws ON t.current_workflow_status_id = ws.id
                LEFT JOIN user_profile cbp ON t.created_by_profile_id = cbp.id
                LEFT JOIN users cbp_user ON cbp.user_id = cbp_user.id
                LEFT JOIN user_profile cf ON t.created_for_profile_id = cf.id
                LEFT JOIN users cf_user ON cf.user_id = cf_user.id
                LEFT JOIN user_profile assignee ON t.assignee_id = assignee.id
                LEFT JOIN users assignee_user ON assignee.user_id = assignee_user.id
                LEFT JOIN patient_task_tracker parent ON t.parent_task_id = parent.id
                LEFT JOIN orders o ON t.order_id = o.id
                LEFT JOIN manufacturing_batches mb ON t.manufacturing_batch_id = mb.id
                LEFT JOIN service_products sp ON t.service_products_id = sp.id
                -- New joins for patient doctor organization added by user
                LEFT JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
                LEFT JOIN user_profile added_by_user_profile ON pdo.org_user_profile_id = added_by_user_profile.id
                LEFT JOIN user_profile customer_user_profile ON pdo.user_profile_id = customer_user_profile.id
                LEFT JOIN users added_by_user ON added_by_user_profile.user_id = added_by_user.id
                LEFT JOIN users customer_user ON customer_user_profile.user_id = customer_user.id
            WHERE t.id IN :ids
            """,
            nativeQuery = true)
    List<PatientTaskTrackerProjection> findByIds(@Param("ids") List<Long> ids);

    @Query(
            value =
                    """
            WITH RankedTasks AS (
                SELECT
                    ptt.id,
                    ptt.current_status_name,
                    ptt.created_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY ptt.current_status_name
                        ORDER BY
                            CASE WHEN :sort = 'PATIENT_NAME' AND :order = 'ASC' THEN p.first_name END ASC,
                            CASE WHEN :sort = 'PATIENT_NAME' AND :order = 'DESC' THEN p.first_name END DESC,
                            CASE WHEN :sort = 'CREATED_ON' AND :order = 'ASC' THEN ptt.created_at END ASC,
                            CASE WHEN :sort = 'CREATED_ON' AND :order = 'DESC' THEN ptt.created_at END DESC,
                            CASE WHEN :sort = 'UPDATED_ON' AND :order = 'ASC' THEN ptt.updated_at END ASC,
                            CASE WHEN :sort = 'UPDATED_ON' AND :order = 'DESC' THEN ptt.updated_at END DESC,
                            CASE WHEN :sort = 'ON_POSITION' AND :order = 'ASC' THEN ptt.sequence_number END ASC,
                            CASE WHEN :sort = 'ON_POSITION' AND :order = 'DESC' THEN ptt.sequence_number END DESC,
                            CASE WHEN :sort = 'NEXT_FOLLOW_UP' AND :order = 'ASC' THEN p.next_follow_up END ASC,
                            CASE WHEN :sort = 'NEXT_FOLLOW_UP' AND :order = 'DESC' THEN p.next_follow_up END DESC,
                            ptt.id DESC
                    ) as row_num
                FROM patient_task_tracker ptt
                LEFT JOIN patient p ON ptt.patient_id = p.id
                LEFT JOIN user_profile cbp ON ptt.created_by_profile_id = cbp.id
                JOIN workflows w ON ptt.workflow_id = w.id
                JOIN workflow_status ws ON ptt.current_workflow_status_id = ws.id
                WHERE (
                    (:assigneeId IS NOT NULL AND ptt.assignee_id = :assigneeId)
                    OR
                    (:assigneeId IS NULL AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId))
                )
                  AND ptt.is_active = true
                  AND ptt.is_archived = false
                  AND (:practiceLocationId IS NULL OR p.practice_location_id = :practiceLocationId)
                  AND (:workflowName IS NULL OR w.name = :workflowName)
                  AND (:orderType IS NULL OR :orderType = '' OR :orderType = ptt.order_type)
                  AND (:serviceProductId IS NULL OR :serviceProductId = ptt.service_product_id)
                  AND (:statusLabelName IS NULL OR :statusLabelName = '' OR ws.label_name = :statusLabelName)
                  AND (
                    :search IS NULL OR :search = ''
                    OR lower(replace(p.first_name, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                    OR lower(replace(p.last_name, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                    OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                    OR lower(replace(p.uuid, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                    OR lower(replace(p.product_type_name, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                    OR lower(replace(ptt.order_type, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                    OR lower(replace(p.customer_mapped_id, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                  )
            )
            SELECT id
            FROM RankedTasks
            WHERE row_num > :offset AND row_num <= (:offset + :pageSize)
            ORDER BY current_status_name, row_num
            """,
            nativeQuery = true)
    List<Long> findPaginatedTaskIdsByWorkflowAndProfile(
            @Param("profileId") Long profileId,
            @Param("search") String search,
            @Param("sort") String sort,
            @Param("order") String order,
            @Param("serviceProductId") Long serviceProductId,
            @Param("orderType") String orderType,
            @Param("workflowName") String workflowName,
            @Param("assigneeId") Long assigneeId,
            @Param("practiceLocationId") Long practiceLocationId,
            @Param("statusLabelName") String statusLabelName,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize);

    @Query(
            value =
                    """
            SELECT COUNT(ptt.id)
            FROM patient_task_tracker ptt
            LEFT JOIN patient p ON ptt.patient_id = p.id
            LEFT JOIN user_profile cbp ON ptt.created_by_profile_id = cbp.id
            JOIN workflow_status ws ON ptt.current_workflow_status_id = ws.id
            WHERE (
                (:assigneeId IS NOT NULL AND ptt.assignee_id = :assigneeId)
                OR
                (:assigneeId IS NULL AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId))
            )
              AND ptt.is_active = true
              AND ptt.is_archived = false
              AND (:practiceLocationId IS NULL OR p.practice_location_id = :practiceLocationId)
              AND ptt.workflow_name = :workflowName
              AND (:orderType IS NULL OR :orderType = '' OR :orderType = ptt.order_type)
              AND (:serviceProductId IS NULL OR :serviceProductId = ptt.service_product_id)
              AND (:statusLabelName IS NULL OR :statusLabelName = '' OR ws.label_name = :statusLabelName)
              AND (
                :search IS NULL OR :search = ''
                OR lower(replace(p.first_name, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                OR lower(replace(p.last_name, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                OR lower(replace(concat(p.first_name, p.last_name), ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                OR lower(replace(p.uuid, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                OR lower(replace(p.product_type_name, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                OR lower(replace(ptt.order_type, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                OR lower(replace(p.customer_mapped_id, ' ', '')) LIKE lower(concat('%', replace(:search, ' ', ''), '%'))
                )
            """,
            nativeQuery = true)
    Long findTotalCountByWorkflowAndProfile(
            @Param("profileId") Long profileId,
            @Param("search") String search,
            @Param("serviceProductId") Long serviceProductId,
            @Param("orderType") String orderType,
            @Param("workflowName") String workflowName,
            @Param("assigneeId") Long assigneeId,
            @Param("practiceLocationId") Long practiceLocationId,
            @Param("statusLabelName") String statusLabelName);

    List<PatientTaskTracker> findByParentTaskId(Long parentTaskId);

    @Query("SELECT t.parentTask.id, t.id FROM PatientTaskTracker t WHERE t.parentTask.id IN :parentTaskIds")
    List<Object[]> findChildTaskIdMappingsByParentTaskIds(@Param("parentTaskIds") List<Long> parentTaskIds);

    @Query(
            value =
                    """
        SELECT
            t.id AS id,
            p.id AS patientId,
            p.uuid AS patientUuid,
            CONCAT(p.first_name, ' ', p.last_name) AS patientName,
            t.created_at AS createdOn,
            cbp_user.first_name AS createdBy,
            p.practice_location_name AS clinicName,
            i.status AS invitationStatus
        FROM patient_task_tracker t
        LEFT JOIN patient p ON t.patient_id = p.id
        LEFT JOIN workflows w ON t.workflow_id = w.id
        LEFT JOIN workflow_status ws ON t.current_workflow_status_id = ws.id
        LEFT JOIN user_profile cbp ON t.created_by_profile_id = cbp.id
        LEFT JOIN users cbp_user ON cbp.user_id = cbp_user.id
        LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
        LEFT JOIN invitation i ON pid.invitation_id = i.id
        LEFT JOIN user_profile cfp ON t.created_for_profile_id = cfp.id
        LEFT JOIN users cfp_user ON cfp.user_id = cfp_user.id
        WHERE t.created_by_profile_id = :profileId
          AND (:workflowName IS NULL OR t.workflow_name = :workflowName)
          AND t.current_status_name = 'Cancelled'
          AND t.is_active = true
          AND (
                :search IS NULL OR :search = '' OR
                LOWER(p.uuid) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.practice_location_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cbp_user.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cbp_user.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(cbp_user.first_name, ' ', cbp_user.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cfp_user.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cfp_user.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(cfp_user.first_name, ' ', cfp_user.last_name)) LIKE LOWER(CONCAT('%', :search, '%'))
              )
        """,
            countQuery =
                    """
        SELECT COUNT(*)
        FROM patient_task_tracker t
        LEFT JOIN patient p ON t.patient_id = p.id
        LEFT JOIN workflows w ON t.workflow_id = w.id
        LEFT JOIN workflow_status ws ON t.current_workflow_status_id = ws.id
        LEFT JOIN user_profile cbp ON t.created_by_profile_id = cbp.id
        LEFT JOIN users cbp_user ON cbp.user_id = cbp_user.id
        LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
        LEFT JOIN invitation i ON pid.invitation_id = i.id
        LEFT JOIN user_profile cfp ON t.created_for_profile_id = cfp.id
        LEFT JOIN users cfp_user ON cfp.user_id = cfp_user.id
        WHERE t.created_by_profile_id = :profileId
          AND (:workflowName IS NULL OR t.workflow_name = :workflowName)
          AND t.current_status_name = 'Cancelled'
          AND t.is_active = true
          AND (
                :search IS NULL OR :search = '' OR
                LOWER(p.uuid) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.practice_location_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cbp_user.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cbp_user.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(cbp_user.first_name, ' ', cbp_user.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cfp_user.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(cfp_user.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(cfp_user.first_name, ' ', cfp_user.last_name)) LIKE LOWER(CONCAT('%', :search, '%'))
              )
        """,
            nativeQuery = true)
    Page<CancelledPatientTaskTrackerProjection> findAllCancelledPatientWithFilter(
            @Param("profileId") Long profileId,
            @Param("search") String search,
            @Param("workflowName") String workflowName,
            Pageable pageable);

    @Query("SELECT ptt FROM PatientTaskTracker ptt "
            + "LEFT JOIN FETCH ptt.patient p "
            + "LEFT JOIN FETCH ptt.workflow w "
            + "LEFT JOIN FETCH ptt.assignee a "
            + "LEFT JOIN FETCH a.user au "
            + "LEFT JOIN FETCH a.inviterProfile cbp "
            + "LEFT JOIN FETCH cbp.doctor cdo "
            + "LEFT JOIN FETCH ptt.currentWorkflowStatus ws "
            + "WHERE ptt.patient.id = :patientId "
            + "AND ptt.isActive = true "
            + "ORDER BY ptt.sequenceNumber ASC, ptt.workflowPosition ASC")
    List<PatientTaskTracker> findPatientTasksByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT COUNT(child) = 0
    FROM PatientTaskTracker child
    JOIN child.currentWorkflowStatus status
    WHERE child.parentTask.id = :parentTaskId
    AND child.isActive = true
    AND UPPER(status.name) != 'PACKAGED'
    """)
    boolean areAllChildTasksPackaged(@Param("parentTaskId") Long parentTaskId);

    @Query(
            value =
                    """
        SELECT
            w.name as workflowName,
            COUNT(ptt.id) as count
        FROM patient_task_tracker ptt
        JOIN workflows w ON ptt.workflow_id = w.id
        WHERE ptt.is_active = true
          AND ptt.is_archived = false
          AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId)
        GROUP BY w.name
        ORDER BY count DESC, w.name ASC
        """,
            nativeQuery = true)
    List<WorkflowCountProjection> findWorkflowCountsByProfileId(@Param("profileId") Long profileId);

    @Query(
            """
        SELECT ptt FROM PatientTaskTracker ptt
        WHERE ptt.currentWorkflowStatus.id = :id
        AND ptt.createdByProfile.id = :profileId
        AND ptt.isActive = true
       """)
    List<PatientTaskTracker> findByWorkflowStatusId(@Param("id") Long id, @Param("profileId") Long profileId);

    @Query(
            value = "SELECT w.label as workflowLabelName, " + "       w.name as workflowName, "
                    + "       ws.label_name as labelName, "
                    + "       ws.name as workflowStatusName, "
                    + "       COALESCE(COUNT(ptt.id), 0) as count "
                    + "FROM workflows w "
                    + "INNER JOIN workflow_status ws ON w.id = ws.workflow_id "
                    + "LEFT JOIN patient_task_tracker ptt ON ptt.current_workflow_status_id = ws.id "
                    + "    AND (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "    AND CASE "
                    + "        WHEN w.name = 'ONGOING PRODUCT LIST' THEN ptt.is_active IN (true, false) "
                    + "        ELSE ptt.is_active = true AND ptt.is_archived = false "
                    + "    END "
                    + "WHERE ((:orgProfileId IS NOT NULL AND w.profile_id = :orgProfileId) OR (:orgProfileId IS NULL AND w.profile_id = :profileId)) "
                    + "  AND w.archived = false "
                    + "  AND ws.label_name IS NOT NULL "
                    + "  AND ws.label_name != '' "
                    + "GROUP BY w.id, w.label, w.name, ws.id, ws.label_name, ws.name, ws.position "
                    + "ORDER BY w.label, ws.position ASC",
            nativeQuery = true)
    List<WorkflowKanbanProjection> findWorkflowKanbanDetailsByProfileId(
            @Param("profileId") Long profileId, @Param("orgProfileId") Long orgProfileId);

    @Query(
            value = "SELECT COUNT(DISTINCT ptt.patient_id) " + "FROM patient_task_tracker ptt "
                    + "WHERE (ptt.created_by_profile_id = :profileId OR ptt.assignee_id = :profileId) "
                    + "  AND ptt.is_active = true "
                    + "  AND ptt.is_archived = false",
            nativeQuery = true)
    Long countUniquePatientsByAssigneeOrCreator(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
        WITH task_stats AS (
            SELECT
                ptt.assignee_id,
                CONCAT(u.first_name, ' ', u.last_name) AS user_name,
                COALESCE(sr.name, 'Unassigned') AS role,
                COUNT(ptt.id) AS case_count,
                SUM(CASE
                    WHEN ptt.estimated_completion_date IS NOT NULL
                         AND ptt.estimated_completion_date < CURRENT_TIMESTAMP
                    THEN 1
                    ELSE 0
                END) AS overdue_count,
                CASE
                    WHEN ptt.assignee_id IS NULL THEN 'UNASSIGNED'
                    ELSE 'ASSIGNED'
                END AS assignee_type
            FROM patient_task_tracker ptt
            INNER JOIN workflows w ON ptt.workflow_id = w.id
            LEFT JOIN user_profile up ON ptt.assignee_id = up.id
            LEFT JOIN users u ON up.user_id = u.id
            LEFT JOIN sub_role sr ON up.sub_role_id = sr.id
            WHERE ptt.created_by_profile_id = :createdByProfileId
              AND w.name IN (:workflowNames)
              AND ptt.is_active = true
            GROUP BY ptt.assignee_id, u.first_name, u.last_name, sr.name
        ),
        total_tasks AS (
            SELECT SUM(case_count) AS total_count
            FROM task_stats
        )
        SELECT
            ts.assignee_id AS assigneeId,
            ts.user_name AS userName,
            ts.role AS role,
            ts.case_count AS caseCount,
            ts.overdue_count AS overdueCount,
            ts.assignee_type AS assigneeType,
            ROUND(CAST(ts.case_count AS NUMERIC) / NULLIF(tt.total_count, 0) * 100, 2) AS percentage,
            tt.total_count AS totalTaskCount
        FROM task_stats ts
        CROSS JOIN total_tasks tt
        ORDER BY ts.case_count DESC
        """,
            nativeQuery = true)
    List<AssigneeDistributionProjection> getAssigneeDistributionByWorkflows(
            @Param("createdByProfileId") Long createdByProfileId, @Param("workflowNames") List<String> workflowNames);

    @Query(
            value =
                    """
            SELECT
                COUNT(CASE WHEN w.name = 'New Case' THEN ptt.id END) AS newCaseCount,
                COUNT(CASE WHEN w.name = 'Plan Outsourced' THEN ptt.id END) AS planOutsourceCount,
                COUNT(CASE WHEN w.name = 'Planning In House' THEN ptt.id END) AS planningInHouseCount,
                COUNT(CASE WHEN w.name = 'Production In House' THEN ptt.id END) AS productionInHouseCount,
                COUNT(CASE WHEN w.name = 'Production Outsource' THEN ptt.id END) AS productionOutsourceCount,
                COUNT(CASE WHEN w.name = 'ONGOING PRODUCT LIST' THEN ptt.id END) AS ongoingProductListCount
            FROM patient_task_tracker ptt
            INNER JOIN workflows w ON ptt.workflow_id = w.id
            WHERE ptt.created_by_profile_id = :createdByProfileId
              AND CASE
                  WHEN w.name = 'ONGOING PRODUCT LIST' THEN ptt.is_active IN (true, false)
                  ELSE ptt.is_active = true
              END
            """,
            nativeQuery = true)
    AssigneeDistributionProjection getWorkflowCounts(@Param("createdByProfileId") Long createdByProfileId);

    @Query(
            value =
                    "SELECT ptt.manufacturing_batch_id as manufacturingBatchId, ws.label_name as labelName, COUNT(*) as count "
                            + "FROM patient_task_tracker ptt "
                            + "JOIN workflow_status ws ON ptt.current_workflow_status_id = ws.id "
                            + "JOIN workflows w ON ptt.workflow_id = w.id "
                            + "WHERE ptt.manufacturing_batch_id IN (:manufacturingBatchIds) "
                            + "AND w.name = :workflowName "
                            + "AND ptt.created_by_profile_id = :profileId "
                            + "GROUP BY ptt.manufacturing_batch_id, ws.label_name",
            nativeQuery = true)
    List<OngoingTaskCountProjection> findOngoingTaskCountsByManufacturingBatchIds(
            @Param("manufacturingBatchIds") List<Long> manufacturingBatchIds,
            @Param("workflowName") String workflowName,
            @Param("profileId") Long profileId);

    void deleteAllByPatientId(Long patientId);

    @Query("SELECT DISTINCT ptt.patient.id FROM PatientTaskTracker ptt "
            + "WHERE (ptt.createdByProfile.id = :profileId OR ptt.assignee.id = :profileId) AND ptt.isArchived != true")
    List<Long> findPatientIdsByCreatedByOrAssignee(@Param("profileId") Long profileId);

    @Query("SELECT ptt FROM PatientTaskTracker ptt " + "JOIN FETCH ptt.workflow w "
            + "LEFT JOIN FETCH w.userProfile wup "
            + "JOIN FETCH ptt.patient p "
            + "LEFT JOIN FETCH ptt.createdByProfile cbp "
            + "LEFT JOIN FETCH cbp.user "
            + "LEFT JOIN FETCH ptt.assignee a "
            + "LEFT JOIN FETCH a.user "
            + "LEFT JOIN FETCH ptt.manufacturingBatch "
            + "WHERE ptt.orgId = :orgId "
            + "AND (wup.id = :profileId OR a.id = :profileId) "
            + "AND ptt.isActive = true "
            + "AND (:query IS NULL OR :query = '' OR ("
            + "    LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "    OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "    OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "    OR LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "    OR ("
            + "        LOWER(p.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :query, ' ', 1), '%')) "
            + "        AND LOWER(p.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :query, ' ', 2), '%')) "
            + "    )"
            + ")) "
            + "ORDER BY ptt.sequenceNumber ASC, ptt.workflowPosition ASC")
    List<PatientTaskTracker> findIndividualPatientTaskByProfileIdAndPatientDetails(
            @Param("orgId") Long orgId, @Param("profileId") Long profileId, @Param("query") String query);

    @Query("SELECT t FROM PatientTaskTracker t " + "JOIN t.workflow w "
            + "WHERE w.name = :workflowName "
            + "AND t.parentTask.id = :parentTaskId "
            + "AND t.isActive = true")
    List<PatientTaskTracker> findByWorkflowNameAndParentTaskId(
            @Param("workflowName") String workflowName, @Param("parentTaskId") Long parentTaskId);

    @Query("SELECT t FROM PatientTaskTracker t " + "JOIN t.workflow w "
            + "JOIN t.childTasks c "
            + "WHERE w.name = :workflowName "
            + "AND c.id = :childTaskId "
            + "AND t.isActive = true")
    List<PatientTaskTracker> findByWorkflowNameAndChildTaskId(
            @Param("workflowName") String workflowName, @Param("childTaskId") Long childTaskId);

    @Query(
            value =
                    """
    SELECT COUNT(DISTINCT ptt.patient_id)
    FROM patient_task_tracker ptt
    JOIN manufacturing_batches mb
      ON mb.id = ptt.manufacturing_batch_id
    WHERE ptt.created_by_profile_id = :userProfileId
      AND ptt.assignee_id = :userProfileId
    """,
            nativeQuery = true)
    int findUniquePatientCount(@Param("userProfileId") Long userProfileId);

    @Query(
            """
    SELECT DISTINCT ptt.patient.id
    FROM PatientTaskTracker ptt
    WHERE ptt.assignee.id = :profileId
    AND ptt.patient.patientStatus != 'ARCHIVE'
    AND (:search IS NULL OR :search = '' OR (
        LOWER(ptt.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(ptt.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(ptt.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(ptt.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(CONCAT(ptt.patient.firstName, ' ', ptt.patient.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
    ))
""")
    List<Long> findPatientIdsByAssignee(@Param("profileId") Long profileId, @Param("search") String search);

    @Query(
            """
    SELECT CASE WHEN COUNT(ptt) > 0 THEN true ELSE false END
    FROM PatientTaskTracker ptt
    WHERE ptt.assignee.id = :profileId
    AND ptt.workflow.name = :workflowName
    AND ptt.isActive = true
    AND ptt.patient.patientStatus != 'ARCHIVE'
""")
    Boolean existsByProfileAndWorkflow(@Param("profileId") Long profileId, @Param("workflowName") String workflowName);

    List<PatientTaskTracker> findByPatientId(String patientId);

    @Modifying
    @Query("""
    update PatientTaskTracker p
    set p.manufacturingBatch = null
    where p.id in :taskIds
""")
    void removeManufacturingBatchReference(List<Long> taskIds);

    @Modifying
    @Transactional
    @Query(
            """
    update PatientTaskTracker p
    set p.isArchived = true,
        p.isActive = false
    where p.patient.id = :patientId
""")
    void markAllTaskArchive(@Param("patientId") Long patientId);
}
