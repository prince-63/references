package com.dentalstack.patient.feature.rbac.repository.auditlog;

import com.dentalstack.patient.feature.rbac.entity.SubRoleAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubRoleAuditRepository extends JpaRepository<SubRoleAudit, Long> {

    @Query(
            value = "SELECT a FROM SubRoleAudit a " + "LEFT JOIN FETCH a.assignedBy ab "
                    + "LEFT JOIN FETCH ab.organization abOrg "
                    + "LEFT JOIN FETCH ab.doctor abDoc "
                    + "LEFT JOIN FETCH ab.user abUser "
                    + "LEFT JOIN FETCH ab.doctorBilling abDb "
                    + "LEFT JOIN FETCH ab.inviterProfile abIp "
                    + "LEFT JOIN FETCH ab.roles abRoles "
                    + "LEFT JOIN FETCH abIp.user abIpu "
                    + "LEFT JOIN FETCH abIp.doctorBilling abIdb "
                    + "LEFT JOIN FETCH a.assignedTo at "
                    + "LEFT JOIN FETCH at.organization atOrg "
                    + "LEFT JOIN FETCH at.doctor atDoc "
                    + "LEFT JOIN FETCH at.user atUser "
                    + "LEFT JOIN FETCH at.doctorBilling atDb "
                    + "LEFT JOIN FETCH at.inviterProfile atIp "
                    + "LEFT JOIN FETCH at.roles atRoles "
                    + "LEFT JOIN FETCH atIp.user atIpu "
                    + "LEFT JOIN FETCH atIp.doctorBilling atIdb "
                    + "LEFT JOIN FETCH a.subRole sr "
                    + "WHERE (:assignedByProfileId IS NULL OR a.assignedBy.id = :assignedByProfileId) "
                    + "ORDER BY a.auditTimestamp DESC",
            countQuery = "SELECT COUNT(a) FROM SubRoleAudit a "
                    + "WHERE (:assignedByProfileId IS NULL OR a.assignedBy.id = :assignedByProfileId)")
    Page<SubRoleAudit> findFilteredAuditLogs(@Param("assignedByProfileId") Long assignedByProfileId, Pageable pageable);
}
