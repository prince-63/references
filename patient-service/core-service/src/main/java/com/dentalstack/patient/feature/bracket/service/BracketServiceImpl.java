package com.dentalstack.patient.feature.bracket.service;

import com.dentalstack.patient.feature.bracket.dto.AddBracketCompanyRequest;
import com.dentalstack.patient.feature.bracket.entity.Bracket;
import com.dentalstack.patient.feature.bracket.entity.BracketSubType;
import com.dentalstack.patient.feature.bracket.entity.BracketType;
import com.dentalstack.patient.feature.bracket.entity.BracketTypeCompany;
import com.dentalstack.patient.feature.bracket.exception.BracketNameAlreadyPresentException;
import com.dentalstack.patient.feature.bracket.repository.BracketRepository;
import com.dentalstack.patient.feature.bracket.repository.BracketSubTypeRepository;
import com.dentalstack.patient.feature.bracket.repository.BracketTypeCompanyRepository;
import com.dentalstack.patient.feature.bracket.repository.BracketTypeRepository;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class BracketServiceImpl implements BracketService {

    private final BracketTypeCompanyRepository bracketTypeCompanyRepository;
    private final BracketSubTypeRepository bracketSubTypeRepository;
    private final BracketRepository bracketRepository;
    private final BracketTypeRepository bracketTypeRepository;

    @Override
    public void addBracketCompanyName(AddBracketCompanyRequest request) {
        var duplicateName =
                bracketTypeCompanyRepository.findByBracketCompanyNameAndIsCommonFalseAndDoctorIdAndBracketSubTypeId(
                        request.getBracketCompanyName(), request.getDoctorId(), request.getBracketSubTypeId());
        if (duplicateName.isPresent()) {
            throw new BracketNameAlreadyPresentException(request.getBracketCompanyName());
        }

        List<BracketTypeCompany> commonBrackets =
                bracketTypeCompanyRepository.findByIsCommonTrueAndBracketSubTypeId(request.getBracketSubTypeId());
        for (BracketTypeCompany bracketTypeCompany : commonBrackets) {
            if (bracketTypeCompany.getBracketCompanyName().equals(request.getBracketCompanyName())) {
                throw new BracketNameAlreadyPresentException(request.getBracketCompanyName());
            }
        }

        var bracketSubType = bracketSubTypeRepository.findById(request.getBracketSubTypeId());
        if (bracketSubType.isPresent()) {
            var material = BracketTypeCompany.builder()
                    .bracketCompanyName(request.getBracketCompanyName())
                    .isCommon(false)
                    .doctorId(request.getDoctorId())
                    .bracketSubType(bracketSubType.get())
                    .build();
            bracketTypeCompanyRepository.save(material);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracketType> getBracketType(Long bracketId) {
        return bracketTypeRepository.findByBracketId(bracketId);
    }

    @Override
    public List<Bracket> getAllBrackets() {
        return bracketRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracketSubType> getBracketSubType(Long doctorId, Long bracketTypeId) {
        return bracketSubTypeRepository.findByBracketTypeId(bracketTypeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracketTypeCompany> getBracketCompany(Long doctorId, Long bracketSubTypeId) {
        List<BracketTypeCompany> doctorBracket =
                bracketTypeCompanyRepository.findByDoctorIdAndBracketSubTypeId(doctorId, bracketSubTypeId);
        List<BracketTypeCompany> commonBracket =
                bracketTypeCompanyRepository.findByIsCommonTrueAndBracketSubTypeId(bracketSubTypeId);
        return Stream.concat(doctorBracket.stream(), commonBracket.stream())
                .distinct()
                .toList();
    }
}
