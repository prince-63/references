package com.dentalstack.patient.feature.storage.repository;

import com.dentalstack.patient.feature.storage.entity.File;
import com.dentalstack.patient.feature.storage.enums.Status;
import com.dentalstack.patient.global.enums.UserType;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {

    @Query(
            """
            SELECT DISTINCT f
            FROM File f
            INNER JOIN FETCH f.owners o
            LEFT JOIN FETCH f.parentFile
            WHERE
                o.userId = :ownerUserId
                AND o.userType = :ownerUserType
                AND f.fullPath = :path
                AND f.status = :status
            """)
    Optional<File> findByOwnerUserIdAndOwnerUserTypeAndFullPathAndStatus(
            @Param("ownerUserId") long ownerUserId,
            @Param("ownerUserType") UserType ownerUserType,
            @Param("path") String path,
            @Param("status") Status status);

    @Query("SELECT SUM(f.size) "
            + "FROM File f "
            + "WHERE f.organization.id = :organizationId "
            + "AND f.status = 'ACTIVE'")
    Long findTotalStorageSizeByOrganization(@Param("organizationId") long organizationId);
}
