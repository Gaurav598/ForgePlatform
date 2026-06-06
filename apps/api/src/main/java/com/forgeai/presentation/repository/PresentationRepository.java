package com.forgeai.presentation.repository;

import com.forgeai.presentation.model.Presentation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PresentationRepository extends MongoRepository<Presentation, String> {
    Page<Presentation> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<Presentation> findByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
    void deleteByIdAndUserId(String id, String userId);
}
