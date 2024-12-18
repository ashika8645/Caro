package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "training_board")
public class TrainingBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_state", nullable = false, columnDefinition = "TEXT")
    private String boardState;

    @Column(name = "description")
    private String description;

    @Column(name = "target_steps", nullable = false)
    private int targetSteps;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBoardState() {
        return boardState;
    }

    public void setBoardState(String boardState) {
        this.boardState = boardState;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getTargetSteps() {
        return targetSteps;
    }

    public void setTargetSteps(int targetSteps) {
        this.targetSteps = targetSteps;
    }
}

