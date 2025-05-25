package com.browncs._final.controller;

import com.browncs._final.model.SlotBlock;
import com.browncs._final.service.OptimizationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class OptimizationController {

  @Autowired private OptimizationService optimizationService;

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
