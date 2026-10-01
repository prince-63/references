package com.dentalstack.patient.feature.flag.util;

import com.dentalstack.patient.feature.flag.entity.Flag;
import com.dentalstack.patient.feature.flag.enums.FlagLocation;
import com.dentalstack.patient.feature.flag.repository.FlagRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class FlagSeedData {

    private final FlagRepository flagRepository;

    public void getFlagSeedData(UserProfile userProfile) {
        Flag flag1 = Flag.builder()
                .isShow(true)
                .content("Users can add or rename production states from Settings → Production Workflow.")
                .userProfile(userProfile)
                .location(FlagLocation.ONGOING_PRODUCTION_LIST.name())
                .build();

        Flag flag2 = Flag.builder()
                .isShow(true)
                .content("Batches are automatically marked as completed once all aligners are shipped.")
                .userProfile(userProfile)
                .location(FlagLocation.ONGOING_PRODUCTION_LIST.name())
                .build();

        flagRepository.saveAll(List.of(flag1, flag2));
    }
}
