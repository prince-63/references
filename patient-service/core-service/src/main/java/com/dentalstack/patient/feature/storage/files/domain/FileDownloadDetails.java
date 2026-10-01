package com.dentalstack.patient.feature.storage.files.domain;

import com.dentalstack.patient.feature.storage.files.entity.File;
import org.springframework.core.io.ByteArrayResource;

public record FileDownloadDetails(File file, ByteArrayResource content) {}
