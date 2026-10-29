package com.skillswap.backend.service;

import com.skillswap.backend.model.SwapRequest;
import com.skillswap.backend.repository.SkillRepository;
import com.skillswap.backend.repository.SwapRequestRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SwapRequestService {

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    public List<SwapRequest> getAllSwapRequests() {
        return swapRequestRepository.findAll();
    }

    public Optional<SwapRequest> getSwapRequestById(Long id) {
        return swapRequestRepository.findById(id);
    }

    public List<SwapRequest> getRequestsBySender(Long senderId) {
        return swapRequestRepository.findBySenderId(senderId);
    }

    public List<SwapRequest> getRequestsByReceiver(Long receiverId) {
        return swapRequestRepository.findByReceiverId(receiverId);
    }

    public SwapRequest createSwapRequest(SwapRequest swapRequest) {
        if (swapRequest.getStatus() == null || swapRequest.getStatus().isEmpty()) {
            swapRequest.setStatus("PENDING");
        }
        return swapRequestRepository.save(swapRequest);
    }

    public SwapRequest createSwapRequest(Long senderId, Long receiverId, Long offeredSkillId,
                                         Long requestedSkillId, String message) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("You cannot send a swap request to yourself");
        }
        var sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        var receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        var offeredSkill = skillRepository.findById(offeredSkillId)
                .orElseThrow(() -> new IllegalArgumentException("Offered skill not found"));
        var requestedSkill = skillRepository.findById(requestedSkillId)
                .orElseThrow(() -> new IllegalArgumentException("Requested skill not found"));
        if (!offeredSkill.getUser().getId().equals(senderId)
                || !"TEACH".equals(offeredSkill.getCategory())) {
            throw new IllegalArgumentException("The offered skill must be taught by the sender");
        }
        if (!requestedSkill.getUser().getId().equals(receiverId)
                || !"TEACH".equals(requestedSkill.getCategory())) {
            throw new IllegalArgumentException("The requested skill must be taught by the receiver");
        }
        SwapRequest request = new SwapRequest(
                sender,
                receiver,
                offeredSkill,
                requestedSkill,
                "PENDING");
        request.setMessage(message);
        return swapRequestRepository.save(request);
    }

    public SwapRequest updateSwapRequestStatus(Long id, String status, Long actorId) {
        SwapRequest request = swapRequestRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Swap Request not found"));
        if (!List.of("ACCEPTED", "REJECTED", "CANCELLED").contains(status)) {
            throw new IllegalArgumentException("Status must be ACCEPTED, REJECTED, or CANCELLED");
        }
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can change status");
        }
        boolean isReceiver = request.getReceiver().getId().equals(actorId);
        boolean isSender = request.getSender().getId().equals(actorId);
        boolean allowedStatus = (isReceiver && List.of("ACCEPTED", "REJECTED").contains(status))
                || (isSender && "CANCELLED".equals(status));
        if (!allowedStatus) {
            throw new AccessDeniedException("You cannot make this status change");
        }
        request.setStatus(status);
        return swapRequestRepository.save(request);
    }

    public void deleteSwapRequest(Long id, Long actorId) {
        SwapRequest request = swapRequestRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Swap Request not found"));
        if (!request.getSender().getId().equals(actorId)
                || !"PENDING".equals(request.getStatus())) {
            throw new AccessDeniedException("Only the sender can delete a pending request");
        }
        swapRequestRepository.delete(request);
    }
}