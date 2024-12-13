package com.example.demo.repository;

import com.example.demo.model.Move;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoveRepository extends JpaRepository<Move, Long> {
    List<Move> findByMatchId(Long matchId);
}
