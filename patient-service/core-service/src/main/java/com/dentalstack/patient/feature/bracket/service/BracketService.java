package com.dentalstack.patient.feature.bracket.service;

import com.dentalstack.patient.feature.bracket.dto.AddBracketCompanyRequest;
import com.dentalstack.patient.feature.bracket.entity.Bracket;
import com.dentalstack.patient.feature.bracket.entity.BracketSubType;
import com.dentalstack.patient.feature.bracket.entity.BracketType;
import com.dentalstack.patient.feature.bracket.entity.BracketTypeCompany;
import java.util.List;

public interface BracketService {
    void addBracketCompanyName(AddBracketCompanyRequest request);

    List<BracketType> getBracketType(Long bracketId);

    List<Bracket> getAllBrackets();

    List<BracketSubType> getBracketSubType(Long doctorId, Long bracketTypeId);

    List<BracketTypeCompany> getBracketCompany(Long doctorId, Long bracketSubTypeId);
}
