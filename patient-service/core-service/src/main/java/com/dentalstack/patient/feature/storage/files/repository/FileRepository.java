package com.dentalstack.patient.feature.storage.files.repository;

import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.user.enums.UserType;
import feign.Param;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FileRepository extends JpaRepository<File, Long>, JpaSpecificationExecutor<File> {

    @Query(
            """
    SELECT f FROM File f
    WHERE f.id IN (:fileIds)
    AND f.status = :status
    AND f.fullPath LIKE CONCAT(:basePath, '%')
""")
    List<File> findByDynamicPath(
            @Param("fileIds") List<Long> fileIds, @Param("basePath") String basePath, @Param("status") Status status);

    @Query(
            value =
                    """
    SELECT fo.file_id
        FROM file_owner fo
        WHERE fo.user_id = :ownerUserId
          AND fo.user_type = :ownerUserType
""",
            nativeQuery = true)
    List<Long> findAllFileIds(@Param("ownerUserId") long ownerUserId, @Param("ownerUserType") String ownerUserType);

    @Query(
            """
SELECT
    f.id,
    f.fullPath,
    f.url,
    up.id,
    d.id
FROM File f
JOIN f.owners o
JOIN f.userProfile up
JOIN up.doctor d
WHERE o.userId = :ownerUserId
  AND o.userType = :ownerUserType
  AND f.id IN :fileIds
""")
    List<Object[]> findFileMetaByOwnerAndFileIds(long ownerUserId, UserType ownerUserType, Set<Long> fileIds);

    @Transactional
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            """
UPDATE File f
SET f.deletedAt = :deletedAt,
    f.deletedBy = :deleter,
    f.deletedByUserType = :userType,
    f.status = :status
WHERE f.id IN (:fileId)
""")
    void softDeleteFileById(
            @Param("fileId") List<Long> fileId,
            @Param("deleter") Long deleter,
            @Param("userType") UserType userType,
            @Param("status") Status status,
            @Param("deletedAt") ZonedDateTime deletedAt);

    @Query(
            """
            SELECT f
                FROM File f
            WHERE
                f.id IN :fileIds
            """)
    List<File> findByFileIds(Set<Long> fileIds);

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
                AND f.folder = true
            """)
    List<File> findByOwnerUserIdAndOwnerUserTypeAndFullPathAndStatusPreTreatment(
            @Param("ownerUserId") long ownerUserId,
            @Param("ownerUserType") UserType ownerUserType,
            @Param("path") String path,
            @Param("status") Status status);

    List<File> findByUploaderUserIdAndUploaderUserTypeAndFullPathAndStatus(
            long uploaderUserId, UserType uploaderUserType, String path, Status status);

    Optional<File> findByFullPath(String fullPath);

    @Query("SELECT f.driveFileId FROM File f WHERE f.fullPath = :fullPath AND f.status = 'ACTIVE'")
    Optional<String> findByDriveFileIdByFileFullPath(String fullPath);

    @Query("SELECT SUM(f.size) "
            + "FROM File f "
            + "WHERE f.organization.id = :organizationId "
            + "AND f.status = 'ACTIVE'")
    Long findTotalStorageSizeByOrganization(@Param("organizationId") long organizationId);

    @Query(
            """
            SELECT f
            FROM File f
            INNER JOIN f.owners o
            WHERE
                o.userId = :ownerUserId
                AND o.userType = :ownerUserType
            """)
    List<File> findByOwnerUserIdAndOwnerUserType(
            @Param("ownerUserId") long ownerUserId, @Param("ownerUserType") UserType ownerUserType);

    @Query(
            """
    SELECT COUNT(f) > 0
    FROM File f
    INNER JOIN f.owners o
    WHERE o.userId = :ownerUserId
    AND o.userType = :ownerUserType
    AND f.fullPath LIKE CONCAT(:fullPath, '%')
    AND f.status = :status
    AND f.folder = false
""")
    boolean existsAnyFileInPath(
            @Param("ownerUserId") long ownerUserId,
            @Param("ownerUserType") UserType ownerUserType,
            @Param("fullPath") String fullPath,
            @Param("status") Status status);

    @Query("SELECT f FROM File f WHERE f.fullPath LIKE CONCAT(:path, '%') AND f.status = :status")
    List<File> findByFullPathStartingWithAndStatus(@Param("path") String path, @Param("status") Status status);

    @Query("SELECT f FROM File f WHERE f.fullPath = :path AND f.status = :status AND f.folder = true")
    Optional<File> findFolderByFullPathAndStatus(@Param("path") String path, @Param("status") Status status);

    @Query("""
        SELECT f FROM File f
        WHERE f.fullPath = :fullPath
        AND f.status = :status
    """)
    Optional<File> findByFullPathAndStatus(@Param("fullPath") String fullPath, @Param("status") Status status);

    @Query("SELECT COUNT(f) > 0 FROM File f " + "JOIN f.owners fo "
            + "WHERE fo.userId = :userId "
            + "AND fo.userType = :userType "
            + "AND f.fullPath = :fullPath "
            + "AND f.status = :status "
            + "AND f.folder = true")
    boolean existsByPatientOwnerAndFullPath(
            @Param("userId") Long userId,
            @Param("userType") UserType userType,
            @Param("fullPath") String fullPath,
            @Param("status") Status status);

    @Query(
            value =
                    """
                    SELECT COUNT(*) > 0
                    FROM file f
                    WHERE f.user_profile_id = :profileId
                      AND f.folder = true
                      AND f.status = 'ACTIVE'
                      AND f.is_default_folder = true
                      AND f.full_path LIKE CONCAT('patient/', :patientId, '\\_%/files/', :folderSuffix) ESCAPE '\\'
                    """,
            nativeQuery = true)
    boolean existsDefaultPatientFolderByProfileAndPatientAndSuffix(
            @Param("profileId") Long profileId,
            @Param("patientId") Long patientId,
            @Param("folderSuffix") String folderSuffix);

    @Query("""
    SELECT f FROM File f
    WHERE f.userProfile.id = :profileId
    """)
    List<File> findAllByProfileId(Long profileId);

    @Query(
            """
            SELECT f
                FROM File f
            LEFT JOIN FETCH
                f.userProfile up
            LEFT JOIN FETCH
                up.doctor d
            WHERE
                f.id = :fileId
            """)
    Optional<File> findByFileId(@Param("fileId") long fileId);

    @Query(
            """
    SELECT f FROM File f
    WHERE (:tagPatientNameWithId IS NOT NULL)
      AND (
            f.fullPath LIKE CONCAT('patient/', :tagPatientNameWithId, '/files/Orders')
         OR f.fullPath LIKE CONCAT('patient/', :tagPatientNameWithId, '/files/Images')
         OR f.fullPath LIKE CONCAT('patient/', :tagPatientNameWithId, '/files/Documents')
      )
""")
    List<File> findAllFileWithMatchingPatient(@Param("tagPatientNameWithId") String tagPatientNameWithId);

    @Query("""
    SELECT f FROM File f
    WHERE f.id IN :fileIds
    ORDER BY f.createdAt DESC
""")
    List<File> findByIds(@Param("fileIds") List<Long> fileIds);

    @Query("""
    SELECT f FROM File f
    WHERE f.url IN :imageUrls
    ORDER BY f.createdAt DESC
""")
    List<File> findByUrls(@Param("imageUrls") List<String> imageUrls);

    @Query("""
    SELECT f FROM File f
    WHERE f.driveFileId IN :driveIds
    ORDER BY f.createdAt DESC
""")
    List<File> findByDriveFileIds(@Param("driveIds") List<String> driveIds);

    @Query(
            """
    SELECT f FROM File f
    WHERE f.fullPath IN :paths
      AND f.folder = true
    ORDER BY LENGTH(f.fullPath) DESC
""")
    List<File> findNearestExistingFolder(List<String> paths);

    @Query("SELECT COUNT(f) FROM File f " + "WHERE f.userProfile.id = :profileId "
            + "AND f.status = :status "
            + "AND (f.isGDrivePlatform IS NULL OR f.isGDrivePlatform = false)")
    long countFilesNeedingMigration(@Param("profileId") Long profileId, @Param("status") Status status);

    @Query("SELECT f FROM File f " + "WHERE f.userProfile.id = :profileId "
            + "AND f.status = :status "
            + "AND (f.isGDrivePlatform IS NULL OR f.isGDrivePlatform = false) "
            + "ORDER BY f.folder DESC, f.createdAt ASC")
    List<File> findFilesNeedingMigrationPaginated(
            @Param("profileId") Long profileId, @Param("status") Status status, Pageable pageable);

    @Query(
            value =
                    """
    select f.id
    from file f
    where f.user_profile_id = :profileId
      and f.status = 'ACTIVE'
      and (f.isgdrive_platform = false or f.isgdrive_platform is null)
      and f.id > :lastId
    order by f.id asc
""",
            nativeQuery = true)
    List<Long> fetchNextFileIds(@Param("profileId") Long profileId, @Param("lastId") Long lastId, Pageable pageable);

    @Query(
            value =
                    """
    select f.id
    from file f
    where f.user_profile_id = :profileId
      and f.status = 'ACTIVE'
      and (f.isgdrive_platform = false or f.isgdrive_platform is null)
      and f.folder = false
      and f.id > :lastId
      and f.full_path like 'patient/%\\_%\\_%/%'
    order by f.id asc
""",
            nativeQuery = true)
    List<Long> fetchNextMoveFileIds(
            @Param("profileId") Long profileId, @Param("lastId") Long lastId, Pageable pageable);

    @Query(
            value =
                    """
    select f.id
    from file f
    where f.user_profile_id = :profileId
      and f.status = 'ACTIVE'
      and (f.isgdrive_platform = false or f.isgdrive_platform is null)
      and f.folder = true
      and f.id > :lastId
      and f.full_path like 'patient/%\\_%\\_%/%'
    order by f.id asc
""",
            nativeQuery = true)
    List<Long> fetchNextMoveFolderIds(
            @Param("profileId") Long profileId, @Param("lastId") Long lastId, Pageable pageable);

    List<File> findByStatus(Status status);

    @Query(
            value =
                    """
    SELECT COUNT(f) FROM file f
    WHERE f.user_profile_id = :profileId
      AND f.status = 'ACTIVE'
    """,
            nativeQuery = true)
    Long countAllFileByProfileId(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT COUNT(f) FROM file f
    WHERE f.user_profile_id = :profileId
      AND f.status = 'DELETED'
    """,
            nativeQuery = true)
    Long countAllDeletedFileByProfileId(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT COUNT(f) FROM file f
    WHERE f.user_profile_id = :profileId
      and (f.isgdrive_platform = false or f.isgdrive_platform is null)
      AND f.status = 'ACTIVE'
    """,
            nativeQuery = true)
    Long countRemainingFileByProfileId(Long profileId);

    @Query(
            value =
                    """
    select f.full_path
    from file f
    where exists (
        select 1
        from unnest(:patientIds) as pid
        where f.full_path like concat('patient/', pid, '_%/files/3D Files/Scan files/%')
    )
    """,
            nativeQuery = true)
    List<String> findAllScanFilesByPatientIds(@Param("patientIds") Long[] patientIds);

    @Query(
            value =
                    """
        select f.full_path
        from file f
        where exists (
            select 1
            from unnest(cast(:patientIds as bigint[])) as pid
            where f.full_path like concat('patient/', pid, '_%/files/Orders/STL Treatment%/%')
        )
        """,
            nativeQuery = true)
    List<String> findAllPrintFilesByPatientIds(@Param("patientIds") Long[] patientIds);

    File findFileByDriveFileId(String fileId);
}
