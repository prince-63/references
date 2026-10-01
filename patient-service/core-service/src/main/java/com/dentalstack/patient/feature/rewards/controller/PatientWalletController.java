package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.PatientWalletInfoRequest;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.service.UserWalletService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/patient/rewards/wallet")
@RequiredArgsConstructor
public class PatientWalletController {

    private final UserWalletService walletService;

    @GetMapping
    public ResponseEntity<WalletResponse> getWallet(@RequestHeader("patientId") Long patientId) {
        WalletResponse response = walletService.getWallet(patientId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<TransactionListResponse> getTransactions(
            @RequestHeader("patientId") Long patientId,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        TransactionListResponse response = walletService.getTransactions(patientId, type, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/all")
    @Operation(
            summary = "Get patients wallet list",
            description = "Fetches a list of patient wallets based on the provided request parameters.")
    public ResponseEntity<PatientWalletInfoListResponse> getPatientRewards(
            @Valid @RequestBody PatientWalletInfoRequest request) {
        PatientWalletInfoListResponse response = walletService.getPatientRewards(request);
        return ResponseEntity.ok(response);
    }
}
