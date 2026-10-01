package com.dentalstack.patient.feature.storage.drive.service;

import com.dentalstack.patient.feature.storage.drive.repository.GoogleDriveTokenRepository;
import com.google.api.client.util.store.AbstractDataStoreFactory;
import com.google.api.client.util.store.DataStore;
import java.io.IOException;
import java.io.Serializable;

public class DatabaseDataStoreFactory extends AbstractDataStoreFactory {

    private final GoogleDriveTokenRepository tokenRepository;

    public DatabaseDataStoreFactory(GoogleDriveTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Override
    protected <V extends Serializable> DataStore<V> createDataStore(String id) throws IOException {
        return new DatabaseDataStore<>(this, id, tokenRepository);
    }
}
