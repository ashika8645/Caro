package com.example.demo.repository;

import com.example.demo.model.TrainingBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainingBoardRepository extends JpaRepository<TrainingBoard, Long> {
}
