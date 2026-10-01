package com.dentalstack.patient.feature.blog.repository;

import com.dentalstack.patient.feature.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {}
