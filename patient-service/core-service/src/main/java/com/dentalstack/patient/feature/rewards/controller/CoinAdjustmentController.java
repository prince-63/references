package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.ManualCoinAdjustmentRequest;
import com.dentalstack.patient.feature.rewards.dto.response.TransactionResponse;
import com.dentalstack.patient.feature.rewards.service.CoinAdjustmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/rewards/admin/coins")
@RequiredArgsConstructor
public class CoinAdjustmentController {

    private final CoinAdjustmentService coinAdjustmentService;

    @PostMapping("/adjust")
    public ResponseEntity<TransactionResponse> adjustCoins(@Valid @RequestBody ManualCoinAdjustmentRequest request) {
        TransactionResponse response = coinAdjustmentService.adjustCoins(request);
        return ResponseEntity.ok(response);
    }
}
