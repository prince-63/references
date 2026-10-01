package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerPhotoProjection;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerPhotoRepository extends JpaRepository<AlignerPhoto, Long> {
    List<AlignerPhoto> findByAlignerIdAndDeletedFalse(Long alignerId);

    boolean existsByAlignerIdAndDeletedFalse(Long alignerId);

    @Query(
            """
    SELECT
        ap.id AS id,
        ap.imageName AS imageName,
        ap.withAligner AS withAligner,
        ap.imageUrl AS imageUrl,
        ap.description AS description,
        ap.uploaderUserType AS uploaderUserType,
        ap.uploadedBy AS uploadedBy,
        a.srNo AS alignerSrNo,
        a.jawType AS jawType
    FROM AlignerPhoto ap
    JOIN ap.aligner a
    JOIN a.alignerJourney aj
    WHERE aj.patient.id = :patientId
    AND ap.deleted = false
    ORDER BY a.srNo ASC, ap.createdAt ASC
""")
    List<AlignerPhotoProjection> findPhotosByPatientId(@Param("patientId") Long patientId);
}
