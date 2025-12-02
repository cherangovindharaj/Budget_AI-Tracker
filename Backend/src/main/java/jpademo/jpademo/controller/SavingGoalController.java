package jpademo.jpademo.controller;

import jpademo.jpademo.model.SavingGoal;
import jpademo.jpademo.model.service.BalanceService;
import jpademo.jpademo.model.service.SavingGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saving-goals")
@CrossOrigin(origins = "*")
public class SavingGoalController {

    @Autowired
    private SavingGoalService service;

    @Autowired
    private BalanceService balanceService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavingGoal>> getGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getGoalsByUser(userId));
    }

    @GetMapping("/user/{userId}/available-balance")
    public ResponseEntity<Map<String, BigDecimal>> getAvailableBalance(@PathVariable Long userId) {
        BigDecimal balance = balanceService.getAvailableBalance(userId);
        return ResponseEntity.ok(Map.of("availableBalance", balance));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SavingGoal goal) {
        try {
            SavingGoal created = service.createGoal(goal);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/add")
    public ResponseEntity<?> addAmount(@PathVariable Long id, @RequestParam Double amount) {
        try {
            SavingGoal updated = service.addAmount(id, amount);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteGoal(id);
        return ResponseEntity.ok().build();
    }
}