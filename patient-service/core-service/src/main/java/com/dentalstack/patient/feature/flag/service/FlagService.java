package com.dentalstack.patient.feature.flag.service;

import com.dentalstack.patient.feature.flag.dto.FlagRequest;

public interface FlagService {
    void toggleFlag(FlagRequest request);
}
