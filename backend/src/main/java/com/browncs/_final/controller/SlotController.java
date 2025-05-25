package com.browncs._final.controller;

import com.browncs._final.model.PreferenceRequest;
import com.browncs._final.model.Slot;
import com.browncs._final.service.SlotService;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class SlotController {

  @Autowired private SlotService slotService;

  @PostMapping("/{eventId}/submit-preferences")
  public ResponseEntity<String> submitPreferences(
      @PathVariable String eventId, @RequestBody PreferenceRequest request) {
    try {
      this.slotService.submitPreferences(eventId, request);
      return ResponseEntity.ok("Preferences submitted.");
    } catch (Exception e) {
      throw new RuntimeException("Hmmm");
    }
  }

  @GetMapping("/{eventId}/get-preferences")
  public ResponseEntity<List<Slot>> getPreferences(@PathVariable String eventId)
      throws ExecutionException, InterruptedException {
    return ResponseEntity.ok(this.slotService.getPreferences(eventId));
  }
}
