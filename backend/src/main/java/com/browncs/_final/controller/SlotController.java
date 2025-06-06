package com.browncs._final.controller;

import com.browncs._final.model.PreferenceRequest;
import com.browncs._final.model.Slot;
import com.browncs._final.service.SlotService;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for handling availability slot submissions and retrievals. Delegates logic to the
 * SlotService for managing participant preferences.
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class SlotController {

  @Autowired private SlotService slotService;

  /**
   * POST /api/events/{eventId}/submit-preferences Accepts participant availability data and saves
   * it under the given event. The request body must contain rankings and deleted slot IDs.
   */
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

  /**
   * GET /api/events/{eventId}/get-preferences Returns all availability slots associated with the
   * given event ID.
   */
  @GetMapping("/{eventId}/get-preferences")
  public ResponseEntity<List<Slot>> getPreferences(@PathVariable String eventId)
      throws ExecutionException, InterruptedException {
    return ResponseEntity.ok(this.slotService.getPreferences(eventId));
  }
}
