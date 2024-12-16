package com.example.demo.controller;

import org.antlr.v4.runtime.misc.NotNull;

public class TrainingBoardRequest {
    @NotNull
    private String boardState;

    @NotNull
    private int targetSteps;

    public String getBoardState() {
        return boardState;
    }

    public void setBoardState(String boardState) {
        this.boardState = boardState;
    }

    public int getTargetSteps() {
        return targetSteps;
    }

    public void setTargetSteps(int targetSteps) {
        this.targetSteps = targetSteps;
    }
}
