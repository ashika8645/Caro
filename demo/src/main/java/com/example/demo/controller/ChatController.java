package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import com.example.demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/chat")
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        return chatService.saveMessage(message);
    }
}
