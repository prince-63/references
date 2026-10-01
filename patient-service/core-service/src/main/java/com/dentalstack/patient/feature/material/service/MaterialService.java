package com.dentalstack.patient.feature.material.service;

import com.dentalstack.patient.feature.material.dto.AddMaterialTool;
import com.dentalstack.patient.feature.material.dto.MaterialStageDetails;
import com.dentalstack.patient.feature.material.entity.Material;
import com.dentalstack.patient.feature.material.entity.MaterialShape;
import com.dentalstack.patient.feature.material.entity.MaterialSize;
import com.dentalstack.patient.feature.material.entity.MaterialTool;
import java.util.List;

public interface MaterialService {

    void AddMaterial(String materialNames, long shapeId, long doctorId);

    void AddMaterialSize(String materialSize, long materialId, long doctorId);

    List<MaterialStageDetails> getAllMaterials();

    List<MaterialShape> getShapesByTreatmentStage(Long stageId);

    List<Material> findMaterialsByShapeId(Long doctorId, Long shapeId);

    List<MaterialSize> findMaterialsSizeByMaterielId(Long doctorId, Long materialId);

    void AddMaterialTool(AddMaterialTool request);

    List<MaterialTool> getMaterialsToolsOfDoctor(Long doctorId);
}
