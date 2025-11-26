package jpademo.jpademo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jpademo.jpademo.model.Income;
import jpademo.jpademo.model.repository.IncomeRepository;

import java.util.*;

@RestController
@RequestMapping("/api/incomes")
@CrossOrigin(origins = "http://localhost:5173")
public class IncomeController {
    
    @Autowired
    private IncomeRepository incomeRepository;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserIncomes(@PathVariable Long userId) {
        try {
            List<Income> incomes = incomeRepository.findByUserIdOrderByIncomeDateDesc(userId);
            return ResponseEntity.ok(incomes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error fetching incomes: " + e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createIncome(@RequestBody Income income) {
        try {
            Income savedIncome = incomeRepository.save(income);
            return ResponseEntity.ok(savedIncome);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error creating income: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIncome(@PathVariable Long id, @RequestBody Income income) {
        try {
            Optional<Income> existingIncome = incomeRepository.findById(id);
            if (existingIncome.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Income not found"));
            }
            
            income.setId(id);
            Income updatedIncome = incomeRepository.save(income);
            return ResponseEntity.ok(updatedIncome);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error updating income: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id) {
        try {
            if (!incomeRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Income not found"));
            }
            
            incomeRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Income deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error deleting income: " + e.getMessage()));
        }
    }
}