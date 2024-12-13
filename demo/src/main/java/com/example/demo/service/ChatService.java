package com.example.demo.service;

import com.example.demo.model.ChatMessage;
import com.example.demo.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    @Autowired
    private ChatMessageRepository chatRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        return chatRepository.save(message);
    }
}
