package com.dentalstack.patient.feature.material.service;

import com.dentalstack.patient.feature.material.entity.*;
import com.dentalstack.patient.feature.material.enums.MaterialShapeEnum;
import com.dentalstack.patient.feature.material.enums.MaterialStageType;
import com.dentalstack.patient.feature.material.enums.MaterialToolType;
import com.dentalstack.patient.feature.material.repository.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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
public class MaterialDefaultDataImpl implements ApplicationRunner {
    private final Environment environment;

    private final MaterialRepository materialRepository;
    private final MaterialShapeRepository materialShapeRepository;
    private final MaterialSizeRepository sizeRepository;
    private final MaterialTreatmentStageRepository stageRepository;
    private final MaterialToolRepository materialToolRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (!environment.acceptsProfiles(Profiles.of("local"))) {
            generateIfRequired();
        }
    }

    private void generateIfRequired() {
        var materialShapes = stageRepository.findAll();
        if (!materialShapes.isEmpty()) {
            log.info("Default data is already present. Not generating again.");
            return;
        }

        List<String> defaultSpaceClosureToolNames = List.of("Active tie backs", "E-chain", "Closed coil", "Loops");
        List<String> defaultAccessoriesToolNames = List.of(
                "Lingual button/ cleats",
                "Torquing spring",
                "Anterior bite turbos",
                "Posterior bite turbos",
                "Elastic thread",
                "Open coil spring",
                "Mini implants",
                "Izc",
                "Buccal shelf",
                "Bone plates",
                "Expansion screws");

        List<MaterialTool> defaultTools = new ArrayList<>();

        defaultTools.addAll(defaultSpaceClosureToolNames.stream()
                .map(toolName -> MaterialTool.builder()
                        .materialToolName(toolName)
                        .materialToolType(MaterialToolType.SPACE_CLOSURE_TOOL)
                        .isCommon(true)
                        .build())
                .toList());

        defaultTools.addAll(defaultAccessoriesToolNames.stream()
                .map(toolName -> MaterialTool.builder()
                        .materialToolName(toolName)
                        .materialToolType(MaterialToolType.ACCESSORIES)
                        .isCommon(true)
                        .build())
                .toList());

        materialToolRepository.saveAll(defaultTools);

        MaterialTreatmentStage levellingStage = createAndSaveTreatmentStage(MaterialStageType.LEVELLING_AND_ALIGNMENT);
        MaterialTreatmentStage retractionStage =
                createAndSaveTreatmentStage(MaterialStageType.SPACE_CLOSURE_RETRACTION);
        MaterialTreatmentStage finishingAndDetailing =
                createAndSaveTreatmentStage(MaterialStageType.FINISHING_AND_DETAILING);

        MaterialShape roundShape = createAndSaveShape(MaterialShapeEnum.ROUND, levellingStage);
        MaterialShape rectangleShape = createAndSaveShape(MaterialShapeEnum.RECTANGLE, levellingStage);
        MaterialShape roundRetractionShape = createAndSaveShape(MaterialShapeEnum.ROUND, retractionStage);
        MaterialShape rectangleRetractionShape = createAndSaveShape(MaterialShapeEnum.RECTANGLE, retractionStage);
        createAndSaveShape(MaterialShapeEnum.ROUND, finishingAndDetailing);
        createAndSaveShape(MaterialShapeEnum.RECTANGLE, finishingAndDetailing);

        List<Material> roundMaterials =
                createAndSaveMaterials(Arrays.asList("NITI", "CU NITI", "COAX", "RCS"), roundShape);

        saveMaterialSizes(roundMaterials, this::createRoundMaterialSizes);

        List<Material> rectangleMaterials =
                createAndSaveMaterials(Arrays.asList("NITI", "CU NITI", "RCS"), rectangleShape);

        saveMaterialSizes(rectangleMaterials, this::createRectangleMaterialSizes);

        List<Material> roundRetractionMaterials =
                createAndSaveMaterials(Collections.singletonList("SS"), roundRetractionShape);

        saveMaterialSizes(roundRetractionMaterials, this::createRoundRetractionMaterialSizes);

        List<Material> rectangleRetractionMaterials =
                createAndSaveMaterials(Arrays.asList("SS", "TMA"), rectangleRetractionShape);

        saveMaterialSizes(rectangleRetractionMaterials, this::createRectangleRetractionMaterialSizes);
    }

    private MaterialTreatmentStage createAndSaveTreatmentStage(MaterialStageType stageType) {
        return stageRepository.save(
                MaterialTreatmentStage.builder().materialStageType(stageType).build());
    }

    private MaterialShape createAndSaveShape(MaterialShapeEnum shapeEnum, MaterialTreatmentStage stage) {
        return materialShapeRepository.save(MaterialShape.builder()
                .materialShape(shapeEnum)
                .treatmentStage(stage)
                .build());
    }

    private List<Material> createAndSaveMaterials(List<String> materialNames, MaterialShape shape) {
        return materialNames.stream()
                .map(name -> Material.builder()
                        .name(name)
                        .isCommon(true)
                        .shape(shape)
                        .build())
                .map(materialRepository::save)
                .toList();
    }

    private void saveMaterialSizes(List<Material> materials, Function<Material, List<MaterialSize>> sizesProvider) {
        materials.forEach(material -> sizeRepository.saveAll(sizesProvider.apply(material)));
    }

    private List<MaterialSize> createRoundMaterialSizes(Material material) {
        return switch (material.getName()) {
            case "NITI", "CU NITI" -> Arrays.asList(
                    MaterialSize.builder()
                            .name("0.012")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.014")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.016")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.018")
                            .material(material)
                            .isCommon(true)
                            .build());
            case "COAX" -> Arrays.asList(
                    MaterialSize.builder()
                            .name("0.0155")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.0175")
                            .material(material)
                            .isCommon(true)
                            .build());
            case "RCS" -> Arrays.asList(
                    MaterialSize.builder()
                            .name("0.014")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.016")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.018")
                            .material(material)
                            .isCommon(true)
                            .build());
            default -> throw new IllegalArgumentException("Unsupported material: " + material.getName());
        };
    }

    private List<MaterialSize> createRectangleMaterialSizes(Material material) {
        return switch (material.getName()) {
            case "NITI" -> Arrays.asList(
                    MaterialSize.builder()
                            .name("0.016 x 0.016")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.016 X 0.022")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.016 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.017 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.018 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.019 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.021 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build());
            case "CU NITI", "RCS" -> Arrays.asList(
                    MaterialSize.builder()
                            .name("0.016 X 0.022")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.016 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.017 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.018 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.019 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build(),
                    MaterialSize.builder()
                            .name("0.021 X 0.025")
                            .material(material)
                            .isCommon(true)
                            .build());
            default -> throw new IllegalArgumentException("Unsupported material: " + material.getName());
        };
    }

    private List<MaterialSize> createRoundRetractionMaterialSizes(Material material) {
        return Arrays.asList(
                MaterialSize.builder()
                        .name("0.014")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.016")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.020")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.018")
                        .material(material)
                        .isCommon(true)
                        .build());
    }

    private List<MaterialSize> createRectangleRetractionMaterialSizes(Material material) {
        return Arrays.asList(
                MaterialSize.builder()
                        .name("0.016 X 0.025")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.017 X 0.025")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.018 X 0.025")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.019 X 0.025")
                        .material(material)
                        .isCommon(true)
                        .build(),
                MaterialSize.builder()
                        .name("0.021 X 0.025")
                        .material(material)
                        .isCommon(true)
                        .build());
    }
}
