package com.dental_stack.files.migration.projections;

public interface LoadFileMatadata {
    public Long getFileId();

    public String getName();

    public String getDriveFileId();

    public String getFullPath();

    public String getUrl();

    public Boolean getIsFolder();

    public String getExtension();
}
