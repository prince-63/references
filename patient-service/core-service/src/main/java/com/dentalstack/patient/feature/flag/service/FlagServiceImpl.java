package com.dentalstack.patient.feature.flag.service;

import com.dentalstack.patient.feature.flag.dto.FlagRequest;
import com.dentalstack.patient.feature.flag.repository.FlagRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class FlagServiceImpl implements FlagService {

    private final FlagRepository flagRepository;

    @Override
    public void toggleFlag(FlagRequest request) {
        flagRepository.toggleFlag(request.getProfileId(), request.getFlagId());
    }
}
