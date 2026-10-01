package com.dental_stack.files.common.entity;

import com.dental_stack.files.migration.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "file",
        indexes = {@Index(name = "IX_file_name", columnList = "name")})
@Getter
@Setter
@Builder
@Slf4j
public class File extends BaseEntity {}
