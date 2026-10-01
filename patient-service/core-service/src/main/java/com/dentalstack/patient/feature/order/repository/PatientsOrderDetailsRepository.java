package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.projection.OrderDetailsProjection;
import feign.Param;
import jakarta.annotation.Nullable;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientsOrderDetailsRepository extends JpaRepository<Order, Long> {

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
        o.id AS orderId,
        o.case_submitted AS caseSubmitted,
        o.doctor_id AS doctorId,
        o.profile_id AS profileId,
        o.organization_id AS organizationId,
        o.order_type AS orderType,
        o.status AS status,
        o.due_by AS dueBy,
        o.is_urgent AS isUrgent,
        o.service_products #>> '{}' AS serviceProducts,
        o.assigned_lab_user_id AS assignedLabUserId,
        o.assigned_lab_user_name AS assignedLabUserName,
        o.created_at AS createdAt,
        o.updated_at AS updatedAt,
        o.need_more_info_remark AS needMoreInfoRemark,
        o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
        o.cancel_order_remark AS cancelOrderRemark,
        o.cancelled_on AS cancelledOn,
        o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

        -- Patient fields
        p.id AS patientId,
        p.first_name AS patientFirstName,
        p.last_name AS patientLastName,

        -- Owner Profile fields
        op.id AS ownerProfileId,
        ou.salutation AS ownerUserSalutation,
        ou.first_name AS ownerUserFirstName,
        ou.last_name AS ownerUserLastName,
        STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

        -- Target Profile fields
        tp.id AS targetProfileId,
        tu.salutation AS targetUserSalutation,
        tu.first_name AS targetUserFirstName,
        tu.last_name AS targetUserLastName,

        -- Parent Order fields
        po.id AS parentOrderId,
        pou.salutation AS parentOwnerUserSalutation,
        pou.first_name AS parentOwnerUserFirstName,
        pou.last_name AS parentOwnerUserLastName,

        -- Child Order fields
        co.id AS childOrderId

    FROM orders o
    LEFT JOIN patient p ON p.id = o.patient_id
    LEFT JOIN user_profile op ON op.id = o.owner_profile_id
    LEFT JOIN users ou ON ou.id = op.user_id
    LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
    LEFT JOIN role r ON r.id = upr.role_id
    LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
    LEFT JOIN users tu ON tu.id = tp.user_id
    LEFT JOIN orders po ON po.id = o.parent_order_id
    LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
    LEFT JOIN users pou ON pou.id = pop.user_id
    LEFT JOIN orders co ON co.id = o.child_order_id
    WHERE op.id IN (:profileIds)
    AND (:patientId IS NULL OR o.patient_id = :patientId)
    AND (:orderStatus IS NULL OR o.status = :orderStatus)
    AND (
        :filterByDueBy IS NULL
        OR
        (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        OR
        (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        OR
        (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
    )
    AND (
        :filterByAssignedUser IS NULL
        OR
        (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
        OR
        (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
        OR
        (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
    )
    AND (
        (:statusName IS NULL)
        OR
        (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
            SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
        ))
        OR
        (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
            SELECT 1 FROM manufacturing_batches mbSub
            WHERE mbSub.order_id = o.id
              AND mbSub.id = (
                  SELECT MAX(mbInner.id)
                  FROM manufacturing_batches mbInner
                  WHERE mbInner.order_id = o.id
              )
              AND (
                  (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                  OR
                  (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                  OR
                  (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
              )
        ))
    )
    AND (
        :search IS NULL OR :search = '' OR (
            LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
            ) OR
            (
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
            )
        )
    )
    GROUP BY
        o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
        o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
        o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
        o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
        p.id, p.first_name, p.last_name,
        op.id, ou.salutation, ou.first_name, ou.last_name,
        tp.id, tu.salutation, tu.first_name, tu.last_name,
        po.id, pou.salutation, pou.first_name, pou.last_name,
        co.id
    ORDER BY
        CASE
            WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
        END ASC,
        CASE
            WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
        END DESC,
        CASE
            WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
        END ASC,
        CASE
            WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
        END DESC,
        CASE
            WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
        END ASC,
        CASE
            WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
        END DESC,
        CASE
            WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
        END DESC
    LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
    """)
    List<OrderDetailsProjection> findSentOrderByProfileIdWithPagination(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.case_submitted AS caseSubmitted,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.is_urgent AS isUrgent,
            o.service_products #>> '{}' AS serviceProducts,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,
            -- Service Product fields (added)
            sp.product_type AS serviceProductType,
            sp.product_name AS serviceProductName,
            sp.product_description AS serviceProductDescription,
            sp.product_image AS serviceProductImage,

            -- Child Order fields
            co.id AS childOrderId,
                        -- Check if order is cloned
            CASE WHEN o.parent_order_id IS NOT NULL THEN true ELSE false END AS isClonedOrder

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id
        LEFT JOIN service_products sp ON sp.id = o.service_product_id
        WHERE (
            (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                AND op.id IN (:profileIds)
            )
          OR (
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0)
                AND op.id = :customerProfileId
            )
        )
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            sp.product_type, sp.product_name, sp.product_description, sp.product_image,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        """)
    List<OrderDetailsProjection> findSentOrdersByProfileId(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.is_urgent AS isUrgent,
            o.service_products #>> '{}' AS serviceProducts,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,
            p.gender AS patientGender,
            p.age AS patientAge,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,

            -- Service Product fields (added)
            sp.product_type AS serviceProductType,
            sp.product_name AS serviceProductName,
            sp.product_description AS serviceProductDescription,
            sp.product_image AS serviceProductImage,

            -- Child Order fields
            co.id AS childOrderId,

            -- Check if order is cloned
            CASE WHEN o.parent_order_id IS NOT NULL THEN true ELSE false END AS isClonedOrder

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id
        LEFT JOIN service_products sp ON sp.id = o.service_product_id
        WHERE (
            (op.id IN (:profileIds) OR tp.id IN (:profileIds))
        )
        AND (
            (
            (:customerProfileId IS NULL OR :customerProfileId = 0)
            OR
            (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND op.id = :customerProfileId)
            )
        )
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND o.status != 'DRAFT'
        AND o.case_submitted = true
        AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            sp.product_type, sp.product_name, sp.product_description, sp.product_image,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
        """)
    List<OrderDetailsProjection> findSentOrdersByProfileIdWithPagination(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Nullable @Param("customerProfileId") Long customerProfileId,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.is_urgent AS isUrgent,
            o.service_products #>> '{}' AS serviceProducts,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,
            p.gender AS patientGender,
            p.age AS patientAge,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,

            -- Service Product fields (added)
            sp.product_type AS serviceProductType,
            sp.product_name AS serviceProductName,
            sp.product_description AS serviceProductDescription,
            sp.product_image AS serviceProductImage,

            -- Child Order fields
            co.id AS childOrderId,

            -- Check if order is cloned
            CASE WHEN o.parent_order_id IS NOT NULL THEN true ELSE false END AS isClonedOrder

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id
        LEFT JOIN service_products sp ON sp.id = o.service_product_id
        WHERE (
            (op.id IN (:profileIds) OR tp.id IN (:profileIds))
        )
        AND (
            (
            (:customerProfileId IS NULL OR :customerProfileId = 0)
            OR
            (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND tp.id = :customerProfileId)
            )
        )
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND o.status != 'DRAFT'
        AND o.case_submitted = true
        AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            sp.product_type, sp.product_name, sp.product_description, sp.product_image,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
        """)
    List<OrderDetailsProjection> practiceSentOrder(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Nullable @Param("customerProfileId") Long customerProfileId,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
                            SELECT
                               o.id AS orderId,
                               o.created_at AS createdAt
                           FROM
                               orders o
                               LEFT JOIN patient p ON p.id = o.patient_id
                               LEFT JOIN user_profile op ON op.id = o.owner_profile_id
                               LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
                           WHERE
                               (
                                   (
                                       op.id IN (:profileIds)
                                       OR tp.id IN (:profileIds)
                                   )
                               )
                               AND (
                                   (
                                       (
                                           :customerProfileId IS NULL
                                           OR :customerProfileId = 0
                                       )
                                       OR (
                                           :customerProfileId IS NOT NULL
                                           AND :customerProfileId != 0
                                           AND op.id = :customerProfileId
                                       )
                                   )
                               )
                               AND o.status != 'DRAFT'
                               AND (
                                   p.patient_status IS NULL
                                   OR p.patient_status != 'ARCHIVE'
                               )
        """)
    List<OrderDetailsProjection> findSentOrdersByProfileIdWithCustomerProfileId(
            @Nullable @Param("profileIds") List<Long> profileIds, @Param("customerProfileId") Long customerProfileId);

    @Query(
            value =
                    """
    SELECT o.id                AS orderId,
           o.created_at       AS createdAt
    FROM orders o
    JOIN patient p ON o.patient_id = p.id
    WHERE o.owner_profile_id = :profileId
      AND o.status != 'DRAFT'
      AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
    ORDER BY o.created_at DESC
    """,
            nativeQuery = true)
    List<OrderDetailsProjection> findDistinctOrdersWithLatestCreatedAt(@Param("profileId") Long profileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id
            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
                (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND op.id = :customerProfileId)
                )
            )
            AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND o.status != 'DRAFT'
            AND o.case_submitted = true
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            """)
    Long countSentOrdersByProfileIdForCustomer(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id
            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
                (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND tp.id = :customerProfileId)
                )
            )
            AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND o.status != 'DRAFT'
            AND o.case_submitted = true
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            """)
    Long practiceSentOrderCount(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT COUNT(DISTINCT o.id)
        FROM orders o
        LEFT JOIN patient p
            ON p.id = o.patient_id
        LEFT JOIN user_profile op
            ON op.id = o.owner_profile_id
        LEFT JOIN user_profile tp
            ON tp.id = o.target_profile_id
        WHERE
            (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
                (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND op.id = :customerProfileId)
                )
            )
            AND o.status != 'DRAFT'
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
        """)
    Long countSentOrdersByProfileIdForCustomerWithInternalProfileIds(
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT
                o.id AS orderId,
                o.doctor_id AS doctorId,
                o.profile_id AS profileId,
                o.organization_id AS organizationId,
                o.order_type AS orderType,
                o.status AS status,
                o.due_by AS dueBy,
                o.is_urgent AS isUrgent,
                o.assigned_lab_user_id AS assignedLabUserId,
                o.assigned_lab_user_name AS assignedLabUserName,
                o.created_at AS createdAt,
                o.updated_at AS updatedAt,
                o.service_products #>> '{}' AS serviceProducts,
                o.need_more_info_remark AS needMoreInfoRemark,
                o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
                o.cancel_order_remark AS cancelOrderRemark,
                o.cancelled_on AS cancelledOn,
                o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

                -- Patient fields
                p.id AS patientId,
                p.first_name AS patientFirstName,
                p.last_name AS patientLastName,
                p.gender AS patientGender,
                p.age AS patientAge,

                -- Owner Profile fields
                op.id AS ownerProfileId,
                ou.salutation AS ownerUserSalutation,
                ou.first_name AS ownerUserFirstName,
                ou.last_name AS ownerUserLastName,
                STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

                -- Target Profile fields
                tp.id AS targetProfileId,
                tu.salutation AS targetUserSalutation,
                tu.first_name AS targetUserFirstName,
                tu.last_name AS targetUserLastName,

                -- Parent Order fields
                po.id AS parentOrderId,
                pou.salutation AS parentOwnerUserSalutation,
                pou.first_name AS parentOwnerUserFirstName,
                pou.last_name AS parentOwnerUserLastName,


               -- Service Product fields (added)
               sp.product_type AS serviceProductType,
               sp.product_name AS serviceProductName,
               sp.product_description AS serviceProductDescription,
               sp.product_image AS serviceProductImage,

                -- Child Order fields
                co.id AS childOrderId,

                -- Check if order is cloned
                CASE WHEN o.parent_order_id IS NOT NULL THEN true ELSE false END AS isClonedOrder

            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
            LEFT JOIN role tr ON tr.id = tpr.role_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id
            LEFT JOIN service_products sp ON sp.id = o.service_product_id

            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
            (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND tp.id = :customerProfileId)
                )
            )
            AND o.status != 'DRAFT'
            AND o.case_submitted = true
            AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND o.status != 'DRAFT'
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            GROUP BY
                o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
                o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
                o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
                o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
                p.id, p.first_name, p.last_name,
                op.id, ou.salutation, ou.first_name, ou.last_name,
                tp.id, tu.salutation, tu.first_name, tu.last_name,
                po.id, pou.salutation, pou.first_name, pou.last_name,
                sp.product_type, sp.product_name, sp.product_description, sp.product_image,
                co.id
            ORDER BY
                CASE
                    WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
                END ASC,
                CASE
                    WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
                END DESC,
                CASE
                    WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
                END ASC,
                CASE
                    WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
                END DESC,
                CASE
                    WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
                END ASC,
                CASE
                    WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
                END DESC,
                CASE
                    WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
                END DESC
            LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
            """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileIdAndPatientIdWithPagination(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Nullable @Param("customerProfileId") Long customerProfileId,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.created_at AS createdAt
        FROM orders o
        LEFT JOIN patient p
            ON p.id = o.patient_id
        LEFT JOIN user_profile op
            ON op.id = o.owner_profile_id
        LEFT JOIN user_profile tp
            ON tp.id = o.target_profile_id
         WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
            (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND tp.id = :customerProfileId)
                )
            )
            AND o.status != 'DRAFT'
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')

        """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileIdAndPatientId(
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
            LEFT JOIN role tr ON tr.id = tpr.role_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id

            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
            (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND tp.id = :customerProfileId)
                )
            )
            AND o.status != 'DRAFT'
            AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND o.status != 'DRAFT'
            AND o.case_submitted = true
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            """)
    Long countReceivedOrdersByProfileIdForCustomer(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
                    SELECT
                        COUNT(DISTINCT o.id)
                    FROM
                        orders o
                        LEFT JOIN patient p ON p.id = o.patient_id
                        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
                        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
                    WHERE
                        (
                            (
                                op.id IN (:profileIds)
                                OR tp.id IN (:profileIds)
                            )
                        )
                        AND (
                            (
                                (
                                    :customerProfileId IS NULL
                                    OR :customerProfileId = 0
                                )
                                OR (
                                    :customerProfileId IS NOT NULL
                                    AND :customerProfileId != 0
                                    AND tp.id = :customerProfileId
                                )
                            )
                        )
                        AND o.status != 'DRAFT'
                        AND (
                            p.patient_status IS NULL
                            OR p.patient_status != 'ARCHIVE'
                        )

        """)
    Long countReceivedOrdersByProfileIdForCustomerWithInternalIds(
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.case_submitted AS caseSubmitted,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.service_products #>> '{}' AS serviceProducts,
            o.is_urgent AS isUrgent,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,

            -- Child Order fields
            co.id AS childOrderId

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
        LEFT JOIN role tr ON tr.id = tpr.role_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

        WHERE tp.id IN (:profileIds)
        AND o.status != 'DRAFT'
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND r.name IN :roles
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
        """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileIdAndRolesWithPagination(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("roles") List<String> roles,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.case_submitted AS caseSubmitted,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.is_urgent AS isUrgent,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.service_products #>> '{}' AS serviceProducts,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,

            -- Child Order fields
            co.id AS childOrderId

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
        LEFT JOIN role tr ON tr.id = tpr.role_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

       WHERE tp.id IN (:profileIds)
        AND o.status != 'DRAFT'
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
        """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileIdWithPagination(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.case_submitted AS caseSubmitted,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.is_urgent AS isUrgent,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.service_products #>> '{}' AS serviceProducts,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,

            -- Child Order fields
            co.id AS childOrderId

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
        LEFT JOIN role tr ON tr.id = tpr.role_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

        WHERE o.assigned_lab_user_id = :profileId
        AND o.status != 'DRAFT'
        AND r.name IN :roles
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
        """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileIdForLabStaffFilterByRoles(
            @Param("profileId") Long profileId,
            @Param("roles") List<String> roles,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            o.id AS orderId,
            o.doctor_id AS doctorId,
            o.profile_id AS profileId,
            o.organization_id AS organizationId,
            o.order_type AS orderType,
            o.status AS status,
            o.due_by AS dueBy,
            o.is_urgent AS isUrgent,
            o.service_products #>> '{}' AS serviceProducts,
            o.assigned_lab_user_id AS assignedLabUserId,
            o.assigned_lab_user_name AS assignedLabUserName,
            o.created_at AS createdAt,
            o.updated_at AS updatedAt,
            o.need_more_info_remark AS needMoreInfoRemark,
            o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
            o.cancel_order_remark AS cancelOrderRemark,
            o.cancelled_on AS cancelledOn,
            o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

            -- Patient fields
            p.id AS patientId,
            p.first_name AS patientFirstName,
            p.last_name AS patientLastName,

            -- Owner Profile fields
            op.id AS ownerProfileId,
            ou.salutation AS ownerUserSalutation,
            ou.first_name AS ownerUserFirstName,
            ou.last_name AS ownerUserLastName,
            STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

            -- Target Profile fields
            tp.id AS targetProfileId,
            tu.salutation AS targetUserSalutation,
            tu.first_name AS targetUserFirstName,
            tu.last_name AS targetUserLastName,

            -- Parent Order fields
            po.id AS parentOrderId,
            pou.salutation AS parentOwnerUserSalutation,
            pou.first_name AS parentOwnerUserFirstName,
            pou.last_name AS parentOwnerUserLastName,

            -- Child Order fields
            co.id AS childOrderId

        FROM orders o
        LEFT JOIN patient p ON p.id = o.patient_id
        LEFT JOIN user_profile op ON op.id = o.owner_profile_id
        LEFT JOIN users ou ON ou.id = op.user_id
        LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
        LEFT JOIN role r ON r.id = upr.role_id
        LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
        LEFT JOIN users tu ON tu.id = tp.user_id
        LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
        LEFT JOIN role tr ON tr.id = tpr.role_id
        LEFT JOIN orders po ON po.id = o.parent_order_id
        LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
        LEFT JOIN users pou ON pou.id = pop.user_id
        LEFT JOIN orders co ON co.id = o.child_order_id

        WHERE o.assigned_lab_user_id = :profileId
        AND o.status != 'DRAFT'
        AND (:orderStatus IS NULL OR o.status = :orderStatus)
        AND (:patientId IS NULL OR o.patient_id = :patientId)
        AND (
            :filterByDueBy IS NULL
            OR
            (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            OR
            (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
        )
        AND (
            :filterByAssignedUser IS NULL
            OR
            (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
            OR
            (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
        )
        AND (
            (:statusName IS NULL)
            OR
            (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
            ))
            OR
            (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                SELECT 1 FROM manufacturing_batches mbSub
                WHERE mbSub.order_id = o.id
                  AND mbSub.id = (
                      SELECT MAX(mbInner.id)
                      FROM manufacturing_batches mbInner
                      WHERE mbInner.order_id = o.id
                  )
                  AND (
                      (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                      OR
                      (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                      OR
                      (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                  )
            ))
        )
        AND (
            :search IS NULL OR :search = '' OR (
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                ) OR
                (
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                )
            )
        )
        GROUP BY
            o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
            o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
            o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
            o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
            p.id, p.first_name, p.last_name,
            op.id, ou.salutation, ou.first_name, ou.last_name,
            tp.id, tu.salutation, tu.first_name, tu.last_name,
            po.id, pou.salutation, pou.first_name, pou.last_name,
            co.id
        ORDER BY
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
            END ASC,
            CASE
                WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
            END DESC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
            END ASC,
            CASE
                WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
            END DESC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
            END ASC,
            CASE
                WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
            END DESC,
            CASE
                WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
            END DESC
        LIMIT :pageSize OFFSET (CAST(:pageNumber AS INTEGER) * CAST(:pageSize AS INTEGER))
        """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileIdForLabStaff(
            @Param("profileId") Long profileId,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT
                o.id AS orderId,
                o.case_submitted AS caseSubmitted,
                o.doctor_id AS doctorId,
                o.profile_id AS profileId,
                o.organization_id AS organizationId,
                o.order_type AS orderType,
                o.status AS status,
                o.due_by AS dueBy,
                o.is_urgent AS isUrgent,
                o.assigned_lab_user_id AS assignedLabUserId,
                o.assigned_lab_user_name AS assignedLabUserName,
                o.created_at AS createdAt,
                o.updated_at AS updatedAt,
                o.service_products #>> '{}' AS serviceProducts,
                o.need_more_info_remark AS needMoreInfoRemark,
                o.is_need_more_info_updated AS isNeedMoreInfoUpdated,
                o.cancel_order_remark AS cancelOrderRemark,
                o.cancelled_on AS cancelledOn,
                o.need_more_info_updated_on AS needMoreInfoUpdatedOn,

                -- Patient fields
                p.id AS patientId,
                p.first_name AS patientFirstName,
                p.last_name AS patientLastName,
                p.gender AS patientGender,
                p.age AS patientAge,

                -- Owner Profile fields
                op.id AS ownerProfileId,
                ou.salutation AS ownerUserSalutation,
                ou.first_name AS ownerUserFirstName,
                ou.last_name AS ownerUserLastName,
                STRING_AGG(DISTINCT r.name, ',' ORDER BY r.name) AS ownerRoleNames,

                -- Target Profile fields
                tp.id AS targetProfileId,
                tu.salutation AS targetUserSalutation,
                tu.first_name AS targetUserFirstName,
                tu.last_name AS targetUserLastName,

                -- Parent Order fields
                po.id AS parentOrderId,
                pou.salutation AS parentOwnerUserSalutation,
                pou.first_name AS parentOwnerUserFirstName,
                pou.last_name AS parentOwnerUserLastName,

                -- Service Product fields (added)
                sp.product_type AS serviceProductType,
                sp.product_name AS serviceProductName,
                sp.product_description AS serviceProductDescription,
                sp.product_image AS serviceProductImage,

                -- Child Order fields
                co.id AS childOrderId,
                -- Check if order is cloned
                CASE WHEN o.parent_order_id IS NOT NULL THEN true ELSE false END AS isClonedOrder

            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN users ou ON ou.id = op.user_id
            LEFT JOIN user_profile_role upr ON upr.user_profile_id = op.id
            LEFT JOIN role r ON r.id = upr.role_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            LEFT JOIN users tu ON tu.id = tp.user_id
            LEFT JOIN user_profile_role tpr ON tpr.user_profile_id = tp.id
            LEFT JOIN role tr ON tr.id = tpr.role_id
            LEFT JOIN orders po ON po.id = o.parent_order_id
            LEFT JOIN user_profile pop ON pop.id = po.owner_profile_id
            LEFT JOIN users pou ON pou.id = pop.user_id
            LEFT JOIN orders co ON co.id = o.child_order_id
            LEFT JOIN service_products sp ON sp.id = o.service_product_id
            WHERE (
                (
                    (:customerProfileId IS NULL OR :customerProfileId = 0)
                    AND tp.id IN (:profileIds)
                )
                OR (
                    (:customerProfileId IS NOT NULL AND :customerProfileId != 0)
                    AND tp.id = :customerProfileId
                )
            )
AND o.status != 'DRAFT'
AND (:patientId IS NULL OR o.patient_id = :patientId)
            AND (:orderStatus IS NULL OR o.status = :orderStatus)
            AND (
                :filterByDueBy IS NULL
                OR
                (:filterByDueBy = 'TODAY' AND o.due_by = CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'OVERDUE' AND o.due_by < CURRENT_DATE AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
                OR
                (:filterByDueBy = 'NOT_ADDED' AND o.due_by IS NULL AND o.status NOT IN ('COMPLETED', 'CANCELLED'))
            )
            AND (
                :filterByAssignedUser IS NULL
                OR
                (:filterByAssignedUser = 'UNASSIGNED' AND o.assigned_lab_user_id IS NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED' AND o.assigned_lab_user_id IS NOT NULL)
                OR
                (:filterByAssignedUser = 'ASSIGNED_TO_ME' AND o.assigned_lab_user_id IS NOT NULL AND o.assigned_lab_user_id = :profileId)
            )
            AND (
                (:statusName IS NULL)
                OR
                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub WHERE mbSub.order_id = o.id
                ))
                OR
                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM manufacturing_batches mbSub
                    WHERE mbSub.order_id = o.id
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM manufacturing_batches mbInner
                          WHERE mbInner.order_id = o.id
                      )
                      AND (
                          (:statusName = 'COMPLETED' AND mbSub.status = 'COMPLETED')
                          OR
                          (:statusName = 'DELIVERED' AND mbSub.status = 'DELIVERED' AND mbSub.batch_type = 'IN_BATCHES')
                          OR
                          (:statusName NOT IN ('COMPLETED', 'DELIVERED') AND mbSub.status = :status)
                      )
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(ou.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(tu.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(o.assigned_lab_user_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    ) OR
                    (
                        LOWER(ou.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 1), '%')) AND
                        LOWER(ou.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:search, ' ', 2), '%'))
                    )
                )
            )
            GROUP BY
                o.id, o.doctor_id, o.profile_id, o.organization_id, o.order_type, o.status,
                o.due_by, o.is_urgent, o.assigned_lab_user_id, o.assigned_lab_user_name,
                o.created_at, o.updated_at, o.need_more_info_remark, o.is_need_more_info_updated,
                o.cancel_order_remark, o.cancelled_on, o.need_more_info_updated_on,
                p.id, p.first_name, p.last_name,
                op.id, ou.salutation, ou.first_name, ou.last_name,
                tp.id, tu.salutation, tu.first_name, tu.last_name,
                po.id, pou.salutation, pou.first_name, pou.last_name,
                sp.product_type, sp.product_name, sp.product_description, sp.product_image,
                co.id
            ORDER BY
                CASE
                    WHEN :sortType = 'date' AND :sortDirection = 'asc' THEN o.created_at
                END ASC,
                CASE
                    WHEN :sortType = 'date' AND :sortDirection = 'desc' THEN o.created_at
                END DESC,
                CASE
                    WHEN :sortType = 'lastUpdated' AND :sortDirection = 'asc' THEN o.updated_at
                END ASC,
                CASE
                    WHEN :sortType = 'lastUpdated' AND :sortDirection = 'desc' THEN o.updated_at
                END DESC,
                CASE
                    WHEN :sortType = 'patientName' AND :sortDirection = 'asc' THEN p.first_name
                END ASC,
                CASE
                    WHEN :sortType = 'patientName' AND :sortDirection = 'desc' THEN p.first_name
                END DESC,
                CASE
                    WHEN :sortType IS NULL OR :sortType = '' THEN o.updated_at
                END DESC
            """)
    List<OrderDetailsProjection> findReceivedOrdersByProfileId(
            @Param("profileId") Long profileId,
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Param("status") String status,
            @Nullable @Param("statusName") String statusName,
            @Nullable @Param("orderStatus") String orderStatus,
            @Nullable @Param("filterByDueBy") String filterByDueBy,
            @Nullable @Param("filterByAssignedUser") String filterByAssignedUser,
            @Nullable @Param("patientId") Long patientId,
            @Param("search") String search,
            @Nullable @Param("sortType") String sortType,
            @Nullable @Param("sortDirection") String sortDirection,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
                (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND op.id = :customerProfileId)
                )
            )
            AND o.status != 'DRAFT'
            AND o.case_submitted = true
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            """)
    Long sentOrderCount(
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
                (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND tp.id = :customerProfileId)
                )
            )
            AND o.status != 'DRAFT'
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            """)
    Long receivedOrderCount(
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Nullable @Param("customerProfileId") Long customerProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT MAX(o.created_at)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            LEFT JOIN user_profile op ON op.id = o.owner_profile_id
            LEFT JOIN user_profile tp ON tp.id = o.target_profile_id
            WHERE (
                (op.id IN (:profileIds) OR tp.id IN (:profileIds))
            )
            AND (
                (
                (:customerProfileId IS NULL OR :customerProfileId = 0)
                OR
                (:customerProfileId IS NOT NULL AND :customerProfileId != 0 AND (op.id = :customerProfileId OR tp.id = :customerProfileId))
                )
            )
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            """)
    LocalDateTime getLastOrderDate(
            @Nullable @Param("profileIds") List<Long> profileIds,
            @Nullable @Param("customerProfileId") Long customerProfileId);
}
