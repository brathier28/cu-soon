package com.browncs._final.controller;

import com.browncs._final.model.SlotBlock;
import com.browncs._final.service.OptimizationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for handling optimization requests. Exposes an endpoint to compute and return
 * optimal time blocks for an event.
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class OptimizationController {

  @Autowired private OptimizationService optimizationService;

  /**
   * GET /api/events/{eventId}/optimize Runs the optimization algorithm for a given event and
   * returns a ranked list of SlotBlocks. The algorithm considers participant availability and
   * necessity weights.
   */
  @GetMapping("/{eventId}/optimize")
  public ResponseEntity<List<SlotBlock>> optimizeEvent(@PathVariable String eventId) {
    try {
      List<SlotBlock> optimizedBlocks = this.optimizationService.optimizeAndSave(eventId);
      return ResponseEntity.ok(optimizedBlocks);
    } catch (Exception e) {
      return ResponseEntity.status(500).body(null);
    }
  }
}
