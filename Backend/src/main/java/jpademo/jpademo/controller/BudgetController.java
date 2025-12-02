package jpademo.jpademo.controller;

import jpademo.jpademo.model.Budget;
import jpademo.jpademo.model.Expense;
import jpademo.jpademo.model.repository.BudgetRepository;
import jpademo.jpademo.model.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {
    
    @Autowired
    private BudgetRepository budgetRepository;
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Budget budget) {
        try {
            Optional<Budget> existing = budgetRepository.findByUserIdAndCategory(
                budget.getUserId(), budget.getCategory()
            );
            
            if (existing.isPresent()) {
                Budget existingBudget = existing.get();
                existingBudget.setLimitAmount(budget.getLimitAmount());
                existingBudget.setPeriod(budget.getPeriod());
                Budget updated = budgetRepository.save(existingBudget);
                return ResponseEntity.ok(updated);
            }
            
            Budget saved = budgetRepository.save(budget);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error creating budget: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBudgets(@PathVariable Long userId) {
        try {
            List<Budget> budgets = budgetRepository.findByUserId(userId);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error fetching budgets"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        try {
            budgetRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Budget deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error deleting budget"));
        }
    }
    
    @GetMapping("/alerts/{userId}")
    public ResponseEntity<?> getBudgetAlerts(@PathVariable Long userId) {
        try {
            List<Budget> budgets = budgetRepository.findByUserId(userId);
            List<Map<String, Object>> alerts = new ArrayList<>();
            
            LocalDate now = LocalDate.now();
            LocalDate startOfMonth = now.withDayOfMonth(1);
            
            for (Budget budget : budgets) {
                List<Expense> allExpenses = expenseRepository.findByUserIdOrderByExpenseDateDesc(userId);
                
                BigDecimal totalSpent = BigDecimal.ZERO;
                for (Expense expense : allExpenses) {
                    if (expense.getCategory().equals(budget.getCategory()) && 
                        !expense.getExpenseDate().isBefore(startOfMonth)) {
                        totalSpent = totalSpent.add(expense.getAmount());
                    }
                }
                
                if (totalSpent.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal percentage = totalSpent
                        .divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                    
                    if (percentage.compareTo(BigDecimal.valueOf(80)) >= 0) {
                        Map<String, Object> alert = new HashMap<>();
                        alert.put("category", budget.getCategory());
                        alert.put("spent", totalSpent);
                        alert.put("limit", budget.getLimitAmount());
                        alert.put("percentage", percentage.doubleValue());
                        alert.put("status", percentage.compareTo(BigDecimal.valueOf(100)) >= 0 ? "EXCEEDED" : "WARNING");
                        alerts.add(alert);
                    }
                }
            }
            
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error fetching alerts: " + e.getMessage()));
        }
    }
}