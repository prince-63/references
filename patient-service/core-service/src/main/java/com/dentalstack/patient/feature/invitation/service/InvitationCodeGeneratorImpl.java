package com.dentalstack.patient.feature.invitation.service;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.InvitationCode;
import com.dentalstack.patient.feature.invitation.exception.FailedToGenerateInvitationCodeException;
import com.dentalstack.patient.feature.invitation.repository.InvitationCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class InvitationCodeGeneratorImpl implements InvitationCodeGenerator {

    private final InvitationCodeRepository invitationCodeRepository;

    @Override
    public InvitationCode generateInvitationCode(Invitation invitation) {
        for (int i = 0; i < 100; i++) {
            var code = RandomStringUtils.randomNumeric(8);
            if (invitationCodeRepository.findByCode(code).isEmpty()) {
                var invitationCode = InvitationCode.newInvite(code, invitation);
                return invitationCodeRepository.save(invitationCode);
            }
        }

        throw new FailedToGenerateInvitationCodeException();
    }
}
