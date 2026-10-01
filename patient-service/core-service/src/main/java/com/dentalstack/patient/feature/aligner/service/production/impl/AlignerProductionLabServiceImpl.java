package com.dentalstack.patient.feature.aligner.service.production.impl;

import com.dentalstack.patient.feature.aligner.dto.aligner.production.lab.AddAlignerProductionLabRequest;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.aligner.repository.AlignerProductionLabRepository;
import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionLabService;
import jakarta.annotation.Nullable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlignerProductionLabServiceImpl implements AlignerProductionLabService, ApplicationRunner {

    private final AlignerProductionLabRepository alignerProductionLabRepository;

    private static final Set<AlignerProductionLabRecord> DEFAULT_LABS = new HashSet<>();

    static {
        DEFAULT_LABS.add(new AlignerProductionLabRecord("32 Watts", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("ClearCorrect", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("DentCare", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Flash", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Flexalign", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord(
                "Glamyo", "https://drive.google.com/file/d/17S4taSbQcM_Z1DfaWUJQoathm1mt8_pR/view?usp=sharing"));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Illusion Aligners", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Invisalign", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Kiyoclear", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord(
                "Lovemysmile", "https://drive.google.com/file/d/1IJEEKskor1xnTYvP73caL_EEyEM5hsxn/view?usp=sharing"));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Odonto", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Pristyn Aligners", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Rio Aligners", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Route to Smile", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("SD Align", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Smile Aligners", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Snazzy", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Spark Aligners", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("TAC Aligners", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Toothsi", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Trueforce", null));
        DEFAULT_LABS.add(new AlignerProductionLabRecord("Vclear", null));
    }

    @Override
    public void autoFillDefaultLabs() {
        DEFAULT_LABS.forEach(r -> {
            if (alignerProductionLabRepository.findByName(r.name).isEmpty()) {
                var prodLab = new AlignerProductionLab(r.name, r.logo, null, null, false);
                log.info("Auto filled a new aligner production lab with name {}", r.name);
                alignerProductionLabRepository.save(prodLab);
            }
        });
    }

    @Override
    public List<AlignerProductionLab> getLabs(@Nullable Long doctorId, Boolean isDefault) {
        return alignerProductionLabRepository.findAll().stream()
                .filter(lab -> (lab.getAddedByUserId() == null
                                || (doctorId != null && doctorId.equals(lab.getAddedByUserId())))
                        && (!isDefault || Boolean.TRUE.equals(lab.getIsDefault())))
                .collect(Collectors.toMap(
                        AlignerProductionLab::getName,
                        lab -> lab,
                        (lab1, lab2) -> Boolean.TRUE.equals(lab1.getIsDefault()) ? lab1 : lab2))
                .values()
                .stream()
                .toList();
    }

    @Override
    public AlignerProductionLab addAlignerProductionLab(AddAlignerProductionLabRequest request) {
        var existingLab =
                alignerProductionLabRepository.findByNameAndAddedByUserId(request.getName(), request.getUserId());

        if (existingLab.isPresent()) {
            var alignerProductionLab = existingLab.get();
            if (Boolean.TRUE.equals(request.getIsDefault())) {
                alignerProductionLabRepository
                        .findByAddedByUserIdAndIsDefault(request.getUserId(), true)
                        .forEach(lab -> {
                            lab.setIsDefault(false);
                            alignerProductionLabRepository.save(lab);
                        });
            }
            alignerProductionLab.setIsDefault(request.getIsDefault());
            log.info(
                    "Updated aligner production lab with name {} added by {} with id {}",
                    request.getName(),
                    request.getUserId(),
                    request.getUserType());
            return alignerProductionLabRepository.save(alignerProductionLab);
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            alignerProductionLabRepository
                    .findByAddedByUserIdAndIsDefault(request.getUserId(), true)
                    .forEach(lab -> {
                        lab.setIsDefault(false);
                        alignerProductionLabRepository.save(lab);
                    });
        }
        log.info(
                "New aligner production lab with name {} added by {} with id {}",
                request.getName(),
                request.getUserId(),
                request.getUserType());
        return alignerProductionLabRepository.save(new AlignerProductionLab(
                request.getName(),
                request.getLogoUrl(),
                request.getUserId(),
                request.getUserType(),
                request.getIsDefault()));
    }

    @Override
    public void run(ApplicationArguments args) {}

    private record AlignerProductionLabRecord(String name, String logo) {}
}
