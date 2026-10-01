package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponse {
    private Long transactionId;
    private TransactionType transactionType;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private LocalDateTime transactionDate;
    private String description;
    private String referenceType;
    private Long referenceId;
}
