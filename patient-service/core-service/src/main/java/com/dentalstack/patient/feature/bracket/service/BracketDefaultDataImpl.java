package com.dentalstack.patient.feature.bracket.service;

import com.dentalstack.patient.feature.bracket.entity.Bracket;
import com.dentalstack.patient.feature.bracket.entity.BracketSubType;
import com.dentalstack.patient.feature.bracket.entity.BracketType;
import com.dentalstack.patient.feature.bracket.entity.BracketTypeCompany;
import com.dentalstack.patient.feature.bracket.enums.BracketNameEnum;
import com.dentalstack.patient.feature.bracket.enums.BracketTypeEnum;
import com.dentalstack.patient.feature.bracket.repository.BracketRepository;
import com.dentalstack.patient.feature.bracket.repository.BracketSubTypeRepository;
import com.dentalstack.patient.feature.bracket.repository.BracketTypeCompanyRepository;
import com.dentalstack.patient.feature.bracket.repository.BracketTypeRepository;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BracketDefaultDataImpl implements ApplicationRunner {

    private final Environment environment;
    private final BracketRepository bracketRepository;
    private final BracketTypeRepository bracketTypeRepository;
    private final BracketTypeCompanyRepository bracketTypeCompanyRepository;
    private final BracketSubTypeRepository bracketSubTypeRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (!environment.acceptsProfiles(Profiles.of("local"))) {
            generateIfRequired();
        }
    }

    private void generateIfRequired() {
        var brackets = bracketRepository.findAll();
        if (!brackets.isEmpty()) {
            log.info("Default data is already present. Not generating again.");
            return;
        }

        Bracket metal = createAndSaveBracket(BracketNameEnum.METAL);
        Bracket aesthetic = createAndSaveBracket(BracketNameEnum.AESTHETIC);

        BracketType metalPreAdjusted = createAndSaveBracketType(BracketTypeEnum.PRE_ADJUSTED_EDGEWISE, metal);
        BracketType metalSelfLigating = createAndSaveBracketType(BracketTypeEnum.SELF_LIGATING, metal);
        BracketType metalLingual = createAndSaveBracketType(BracketTypeEnum.LINGUAL, metal);
        BracketType aestheticPreAdjusted = createAndSaveBracketType(BracketTypeEnum.PRE_ADJUSTED_EDGEWISE, aesthetic);
        BracketType aestheticSelfLigating = createAndSaveBracketType(BracketTypeEnum.SELF_LIGATING, aesthetic);

        List<BracketSubType> preAdjustedBracketSubType =
                createAndSaveBracketSubType(Arrays.asList("0.018", "0.022"), metalPreAdjusted);

        saveBracketTypeCompanyName(preAdjustedBracketSubType, this::createPreAdjustedBracketTypeCompanyName);

        List<BracketSubType> selfLigatingBracketSubType =
                createAndSaveBracketSubType(Arrays.asList("Active", "Passive", "Hybrid"), metalSelfLigating);

        saveBracketTypeCompanyName(selfLigatingBracketSubType, this::createSelfLigatingBracketTypeCompanyName);

        createAndSaveBracketSubType(List.of("No sub-type"), metalLingual);

        List<BracketSubType> aestheticPreAdjustedBracketSubType =
                createAndSaveBracketSubType(Arrays.asList("0.018", "0.022"), aestheticPreAdjusted);

        saveBracketTypeCompanyName(
                aestheticPreAdjustedBracketSubType, this::createAestheticPreAdjustedBracketTypeCompanyName);

        List<BracketSubType> aestheticSelfLigatingBracketSubType =
                createAndSaveBracketSubType(Arrays.asList("Active", "Passive", "Hybrid"), aestheticSelfLigating);

        saveBracketTypeCompanyName(
                aestheticSelfLigatingBracketSubType, this::createAestheticSelfLigatingBracketTypeCompanyName);
    }

    private Bracket createAndSaveBracket(BracketNameEnum bracketNameEnum) {
        return bracketRepository.save(
                Bracket.builder().materialStageType(bracketNameEnum).build());
    }

    private BracketType createAndSaveBracketType(BracketTypeEnum bracketTypeEnum, Bracket bracket) {
        return bracketTypeRepository.save(BracketType.builder()
                .bracketTypeEnum(bracketTypeEnum)
                .bracket(bracket)
                .build());
    }

    private List<BracketSubType> createAndSaveBracketSubType(List<String> bracketSubTypeName, BracketType bracketType) {
        return bracketSubTypeName.stream()
                .map(name -> BracketSubType.builder()
                        .bracketSubTypeName(name)
                        .bracketType(bracketType)
                        .build())
                .map(bracketSubTypeRepository::save)
                .toList();
    }

    private void saveBracketTypeCompanyName(
            List<BracketSubType> bracketSubTypes, Function<BracketSubType, List<BracketTypeCompany>> sizesProvider) {
        bracketSubTypes.forEach(
                bracketSubType -> bracketTypeCompanyRepository.saveAll(sizesProvider.apply(bracketSubType)));
    }

    private List<BracketTypeCompany> createPreAdjustedBracketTypeCompanyName(BracketSubType bracketSubType) {
        return switch (bracketSubType.getBracketSubTypeName()) {
            case "0.018", "0.022" -> Arrays.asList(
                    BracketTypeCompany.builder()
                            .bracketCompanyName("3M")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Ormco")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("American Orthodontics")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Forestadent")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Tommy")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Aditek")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build());
            default -> throw new IllegalArgumentException(
                    "Unsupported material: " + bracketSubType.getBracketSubTypeName());
        };
    }

    private List<BracketTypeCompany> createSelfLigatingBracketTypeCompanyName(BracketSubType bracketSubType) {
        return switch (bracketSubType.getBracketSubTypeName()) {
            case "Active", "Passive", "Hybrid" -> Arrays.asList(
                    BracketTypeCompany.builder()
                            .bracketCompanyName("3M")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Ormco")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("American Orthodontics")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Forestadent")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Tommy")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build());
            default -> throw new IllegalArgumentException(
                    "Unsupported bracket sub-type: " + bracketSubType.getBracketSubTypeName());
        };
    }

    private List<BracketTypeCompany> createAestheticPreAdjustedBracketTypeCompanyName(BracketSubType bracketSubType) {
        return switch (bracketSubType.getBracketSubTypeName()) {
            case "0.018", "0.022" -> Arrays.asList(
                    BracketTypeCompany.builder()
                            .bracketCompanyName("3M")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Ormco")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("American Orthodontics")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Forestadent")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Tommy")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Aditek")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build());
            default -> throw new IllegalArgumentException(
                    "Unsupported bracket sub-type: " + bracketSubType.getBracketSubTypeName());
        };
    }

    private List<BracketTypeCompany> createAestheticSelfLigatingBracketTypeCompanyName(BracketSubType bracketSubType) {
        return switch (bracketSubType.getBracketSubTypeName()) {
            case "Active", "Passive", "Hybrid" -> Arrays.asList(
                    BracketTypeCompany.builder()
                            .bracketCompanyName("3M")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Ormco")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("American Orthodontics")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Forestadent")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build(),
                    BracketTypeCompany.builder()
                            .bracketCompanyName("Tommy")
                            .bracketSubType(bracketSubType)
                            .isCommon(true)
                            .build());
            default -> throw new IllegalArgumentException(
                    "Unsupported bracket sub-type: " + bracketSubType.getBracketSubTypeName());
        };
    }
}
