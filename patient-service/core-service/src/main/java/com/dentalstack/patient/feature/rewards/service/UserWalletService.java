package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.PatientWalletInfoRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PatientWalletInfoListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.TransactionListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.WalletResponse;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import org.springframework.transaction.annotation.Transactional;

public interface UserWalletService {

    @Transactional
    WalletResponse getWallet(Long patientId);

    @Transactional
    UserWallet createWalletForPatient(Long patientId);

    @Transactional(readOnly = true)
    TransactionListResponse getTransactions(Long patientId, String type, int page, int size);

    @Transactional(readOnly = true)
    PatientWalletInfoListResponse getPatientRewards(PatientWalletInfoRequest request);
}
