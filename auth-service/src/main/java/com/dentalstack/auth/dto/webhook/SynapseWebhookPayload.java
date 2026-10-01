package com.dentalstack.auth.dto.webhook;

import com.dentalstack.auth.dto.AuthDetails;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SynapseWebhookPayload {
    private Instant timestamp;
    private AuthDetails authDetails;
}
