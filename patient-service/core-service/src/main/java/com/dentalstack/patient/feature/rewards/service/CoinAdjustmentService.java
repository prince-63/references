package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.ManualCoinAdjustmentRequest;
import com.dentalstack.patient.feature.rewards.dto.response.TransactionResponse;
import jakarta.validation.Valid;

public interface CoinAdjustmentService {

    TransactionResponse adjustCoins(@Valid ManualCoinAdjustmentRequest request);
}
