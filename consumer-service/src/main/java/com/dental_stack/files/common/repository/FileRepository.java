package com.dental_stack.files.common.repository;

import com.dental_stack.files.common.entity.File;
import com.dental_stack.files.migration.projections.LoadFileMatadata;
import com.dental_stack.files.move_file.projections.FilePathView;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<File, Long> {

    @Query(
            value =
                    """
    SELECT
        f.id AS fileId,
        f.name AS name,
        f.full_path AS fullPath,
        f.url AS url,
        f.folder AS isFolder,
        f.extension AS extension,
        f.drive_file_id AS driveFileId
    FROM file AS f
    WHERE f.id IN (:fileIds)
    ORDER BY f.folder DESC
    """,
            nativeQuery = true)
    List<LoadFileMatadata> loadFileMetadatas(@Param("fileIds") List<Long> fileIds);

    @Query(
            value =
                    """
        SELECT drive_file_id
        FROM file
        WHERE folder = true
          AND drive_file_id IS NOT NULL
          AND (
                full_path LIKE '%/3D Files/Scan files%'
                OR full_path LIKE '%/Orders/STL Treatment %%'
          )
          AND id IN (:fileIds)
        """,
            nativeQuery = true)
    List<String> loadDriveFileId(@Param("fileIds") List<Long> fileIds);

    @Query(
            value =
                    """
        SELECT (regexp_matches(full_path, 'patient/([0-9]+)_'))[1]::BIGINT
        FROM file
        WHERE id IN (:fileIds)
          AND full_path ~ 'patient/[0-9]+_'
        LIMIT 1
        """,
            nativeQuery = true)
    Long getPatientId(@Param("fileIds") List<Long> fileIds);

    @Modifying
    @Query(
            value =
                    """
        UPDATE file SET
            drive_file_id = :driveFileId,
            full_path = :fullPath,
            isgdrive_platform = true
        WHERE id = :fileId
    """,
            nativeQuery = true)
    void updateFolderMetadata(
            @Param("fileId") Long fileId,
            @Param("driveFileId") String driveFileId,
            @Param("fullPath") String fullPath);

    @Modifying
    @Query(
            value =
                    """
        UPDATE file SET
            drive_file_id = :driveFileId,
            url = :url,
            full_path = :fullPath,
            thumbnail_url = :thumbnailUrl,
            download_url = :downloadUrl,
            isgdrive_platform = true
        WHERE id = :fileId
    """,
            nativeQuery = true)
    void updateFileMetadata(
            @Param("fileId") Long fileId,
            @Param("driveFileId") String driveFileId,
            @Param("url") String url,
            @Param("fullPath") String fullPath,
            @Param("thumbnailUrl") String thumbnailUrl,
            @Param("downloadUrl") String downloadUrl);

    @Query(
            value =
                    """
        select
            f.full_path as fullPath,
            f.folder as folder
        from file f
        where f.id in (:fileIds)
        """,
            nativeQuery = true)
    List<FilePathView> findFileFullPathById(@Param("fileIds") List<Long> fileIds);

    @Modifying
    @Query(
            value =
                    """
                    update file
                    set full_path = :newPath,
                        url = :url
                    where full_path = :oldPath
                    """,
            nativeQuery = true)
    void updateMovedFile(
            @Param("oldPath") String oldPath,
            @Param("newPath") String newPath,
            @Param("url") String url);
}
