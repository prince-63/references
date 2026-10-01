package com.dentalstack.patient.feature.bracket.repository;

import com.dentalstack.patient.feature.bracket.entity.BracketTypeCompany;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BracketTypeCompanyRepository extends JpaRepository<BracketTypeCompany, Long> {

    @Query(
            "SELECT btc FROM BracketTypeCompany btc LEFT JOIN FETCH btc.bracketSubType bst LEFT JOIN FETCH bst.bracketType bt LEFT JOIN FETCH bt.bracket WHERE btc.isCommon = true AND btc.bracketSubType.id = :bracketSubTypeId")
    List<BracketTypeCompany> findByIsCommonTrueAndBracketSubTypeId(@Param("bracketSubTypeId") Long bracketSubTypeId);

    @Query(
            "SELECT btc FROM BracketTypeCompany btc LEFT JOIN FETCH btc.bracketSubType bst LEFT JOIN FETCH bst.bracketType bt LEFT JOIN FETCH bt.bracket WHERE btc.doctorId = :doctorId AND btc.bracketSubType.id = :bracketSubTypeId")
    List<BracketTypeCompany> findByDoctorIdAndBracketSubTypeId(
            @Param("doctorId") Long doctorId, @Param("bracketSubTypeId") Long bracketSubTypeId);

    Optional<BracketTypeCompany> findByBracketCompanyNameAndIsCommonFalseAndDoctorId(String name, Long doctorId);

    Optional<BracketTypeCompany> findByBracketCompanyNameAndIsCommonFalseAndDoctorIdAndBracketSubTypeId(
            String name, Long doctorId, Long bracesSubTypeId);
}
