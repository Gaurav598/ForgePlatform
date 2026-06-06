package com.forgeai.resume.repository;

import com.forgeai.resume.model.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    Page<Resume> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<Resume> findByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
}
