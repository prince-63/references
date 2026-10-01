package com.dentalstack.patient.feature.material.service;

import com.dentalstack.patient.feature.material.dto.AddMaterialTool;
import com.dentalstack.patient.feature.material.dto.MaterialStageDetails;
import com.dentalstack.patient.feature.material.entity.*;
import com.dentalstack.patient.feature.material.exception.MaterialAlreadyPresentException;
import com.dentalstack.patient.feature.material.repository.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialShapeRepository materialShapeRepository;
    private final MaterialSizeRepository sizeRepository;
    private final MaterialTreatmentStageRepository stageRepository;
    private final MaterialToolRepository materialToolRepository;

    @Override
    public void AddMaterial(String materialName, long shapeId, long doctorId) {
        var shape = materialShapeRepository.findById(shapeId);
        if (shape.isPresent()) {
            Optional<Material> isDuplicateMaterialForShape =
                    materialRepository.findByNameAndShapeIdAndIsCommonFalseAndDoctorId(materialName, shapeId, doctorId);
            if (isDuplicateMaterialForShape.isPresent()) {
                throw new MaterialAlreadyPresentException(materialName);
            }
            List<Material> commonMaterials = materialRepository.findByIsCommonTrueAndShapeId(shapeId);
            for (Material material : commonMaterials) {
                if (material.getName().equals(materialName)) {
                    throw new MaterialAlreadyPresentException(materialName);
                }
            }
        }
        if (shape.isPresent()) {
            var material = Material.builder()
                    .name(materialName)
                    .isCommon(false)
                    .doctorId(doctorId)
                    .shape(shape.get())
                    .build();
            materialRepository.save(material);
        }
    }

    @Override
    public void AddMaterialSize(String materialSize, long materialId, long doctorId) {
        Optional<MaterialSize> isDuplicateMaterial =
                sizeRepository.findByNameAndIsCommonFalseAndDoctorIdAndMaterialId(materialSize, doctorId, materialId);

        if (isDuplicateMaterial.isPresent()) {
            throw new MaterialAlreadyPresentException(materialSize);
        }

        List<MaterialSize> commonMaterials = sizeRepository.findByIsCommonTrueAndMaterialId(materialId);
        for (MaterialSize size : commonMaterials) {
            if (size.getName().equals(materialSize)) {
                throw new MaterialAlreadyPresentException(materialSize);
            }
        }
        var size = materialRepository.findById(materialId);
        if (size.isPresent()) {
            var material = MaterialSize.builder()
                    .name(materialSize)
                    .isCommon(false)
                    .doctorId(doctorId)
                    .material(size.get())
                    .build();
            sizeRepository.save(material);
        }
    }

    @Override
    public List<MaterialStageDetails> getAllMaterials() {
        List<MaterialTreatmentStage> treatmentStages = stageRepository.findAll();
        return treatmentStages.stream().map(MaterialStageDetails::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialShape> getShapesByTreatmentStage(Long stageId) {
        return materialShapeRepository.findByTreatmentStageId(stageId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Material> findMaterialsByShapeId(Long doctorId, Long shapeId) {
        List<Material> doctorMaterials = materialRepository.findByDoctorIdAndShapeId(doctorId, shapeId);
        List<Material> commonMaterials = materialRepository.findByIsCommonTrueAndShapeId(shapeId);
        return Stream.concat(doctorMaterials.stream(), commonMaterials.stream())
                .distinct()
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialSize> findMaterialsSizeByMaterielId(Long doctorId, Long materialId) {
        List<MaterialSize> doctorMaterialsSize = sizeRepository.findByDoctorIdAndMaterialId(doctorId, materialId);
        List<MaterialSize> commonMaterialsSize = sizeRepository.findByIsCommonTrueAndMaterialId(materialId);
        return Stream.concat(doctorMaterialsSize.stream(), commonMaterialsSize.stream())
                .distinct()
                .sorted(Comparator.comparing(MaterialSize::getName))
                .toList();
    }

    @Override
    public void AddMaterialTool(AddMaterialTool request) {
        var material = MaterialTool.builder()
                .materialToolName(request.getMaterialName())
                .isCommon(false)
                .doctorId(request.getDoctorId())
                .materialToolType(request.getMaterialToolType())
                .build();
        materialToolRepository.save(material);
    }

    @Override
    public List<MaterialTool> getMaterialsToolsOfDoctor(Long doctorId) {
        List<MaterialTool> allTools = fetchToolsForDoctor(doctorId);
        return allTools.stream().distinct().toList();
    }

    private List<MaterialTool> fetchToolsForDoctor(Long doctorId) {
        List<MaterialTool> individualTools = materialToolRepository.findByDoctorId(doctorId);
        List<MaterialTool> commonTools = materialToolRepository.findByIsCommonTrue();

        List<MaterialTool> allTools = new ArrayList<>();
        allTools.addAll(individualTools);
        allTools.addAll(commonTools);

        return allTools;
    }
}
