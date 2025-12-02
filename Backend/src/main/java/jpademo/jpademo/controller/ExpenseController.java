package jpademo.jpademo.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jpademo.jpademo.model.Expense;
import jpademo.jpademo.model.repository.ExpenseRepository;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    // Get all expenses
    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        try {
            List<Expense> expenses = expenseRepository.findAll();
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Get expenses by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getExpensesByUserId(@PathVariable Long userId) {
        try {
            List<Expense> expenses = expenseRepository.findByUserId(userId);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ NEW: Get expense statistics for a user
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getExpenseStats(@PathVariable Long userId) {
        try {
            System.out.println("=== Fetching stats for user: " + userId + " ===");
            
            List<Expense> expenses = expenseRepository.findByUserId(userId);
            
            // Calculate total expenses
            double totalExpenses = expenses.stream()
                .mapToDouble(e -> e.getAmount().doubleValue())
                .sum();
            
            // Calculate monthly expenses (current month)
            LocalDate now = LocalDate.now();
            int currentMonth = now.getMonthValue();
            int currentYear = now.getYear();
            
            double monthlyExpenses = expenses.stream()
                .filter(e -> {
                    LocalDate expDate = e.getExpenseDate();
                    return expDate.getMonthValue() == currentMonth && 
                           expDate.getYear() == currentYear;
                })
                .mapToDouble(e -> e.getAmount().doubleValue())
                .sum();
            
            // Calculate category-wise totals
            Map<String, Double> categoryTotals = new HashMap<>();
            for (Expense expense : expenses) {
                String category = expense.getCategory();
                double amount = expense.getAmount().doubleValue();
                categoryTotals.put(category, categoryTotals.getOrDefault(category, 0.0) + amount);
            }
            
            // Build response
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalExpenses", totalExpenses);
            stats.put("monthlyExpenses", monthlyExpenses);
            stats.put("totalIncome", 0.0); // Future: implement income tracking
            stats.put("balance", 0.0 - totalExpenses); // Negative balance = spent money
            stats.put("expenseCount", expenses.size());
            stats.put("categoryTotals", categoryTotals);
            
            System.out.println("=== Stats calculated successfully ===");
            System.out.println("Total Expenses: " + totalExpenses);
            System.out.println("Monthly Expenses: " + monthlyExpenses);
            System.out.println("Expense Count: " + expenses.size());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("=== Error fetching stats ===");
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error fetching stats: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Create new expense
    @PostMapping
    public ResponseEntity<?> createExpense(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== Received request ===");
            System.out.println(request);
            
            Expense expense = new Expense();
            
            // Set amount
            Object amountObj = request.get("amount");
            if (amountObj == null) {
                return ResponseEntity.badRequest().body("Amount is required");
            }
            BigDecimal amount;
            if (amountObj instanceof Number) {
                amount = new BigDecimal(amountObj.toString());
            } else if (amountObj instanceof String) {
                amount = new BigDecimal((String) amountObj);
            } else {
                return ResponseEntity.badRequest().body("Invalid amount format");
            }
            expense.setAmount(amount);
            
            // Set category
            String category = (String) request.get("category");
            if (category == null || category.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category is required");
            }
            expense.setCategory(category);
            
            // Set description
            String description = (String) request.get("description");
            expense.setDescription(description != null ? description : "");
            
            // Parse and set date
            String dateStr = (String) request.get("date");
            if (dateStr == null || dateStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Date is required");
            }
            
            LocalDate expenseDate;
            try {
                expenseDate = LocalDate.parse(dateStr);
                System.out.println("Parsed date: " + expenseDate);
            } catch (Exception e) {
                System.err.println("Date parse error: " + e.getMessage());
                return ResponseEntity.badRequest().body("Invalid date format. Expected YYYY-MM-DD, got: " + dateStr);
            }
            expense.setExpenseDate(expenseDate);
            
            // Set user ID
            Object userIdObj = request.get("userId");
            if (userIdObj == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            Long userId = Long.parseLong(userIdObj.toString());
            expense.setUserId(userId);
            
            // Set created timestamp
            expense.setCreatedAt(LocalDateTime.now());
            
            System.out.println("=== Saving expense ===");
            System.out.println("Amount: " + expense.getAmount());
            System.out.println("Category: " + expense.getCategory());
            System.out.println("Date: " + expense.getExpenseDate());
            System.out.println("UserId: " + expense.getUserId());
            
            // Save to database
            Expense savedExpense = expenseRepository.save(expense);
            
            System.out.println("=== Expense saved successfully ===");
            System.out.println("ID: " + savedExpense.getId());
            
            return ResponseEntity.ok(savedExpense);
            
        } catch (Exception e) {
            System.err.println("=== Error creating expense ===");
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error creating expense: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Get expense by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getExpenseById(@PathVariable Long id) {
        try {
            return expenseRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Update expense
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== Updating expense ID: " + id + " ===");
            System.out.println(request);
            
            return expenseRepository.findById(id)
                    .map(expense -> {
                        // Update amount
                        if (request.containsKey("amount")) {
                            Object amountObj = request.get("amount");
                            BigDecimal amount = new BigDecimal(amountObj.toString());
                            expense.setAmount(amount);
                        }
                        
                        // Update category
                        if (request.containsKey("category")) {
                            expense.setCategory((String) request.get("category"));
                        }
                        
                        // Update description
                        if (request.containsKey("description")) {
                            String desc = (String) request.get("description");
                            expense.setDescription(desc != null ? desc : "");
                        }
                        
                        // Update date
                        if (request.containsKey("date")) {
                            String dateStr = (String) request.get("date");
                            LocalDate expenseDate = LocalDate.parse(dateStr);
                            expense.setExpenseDate(expenseDate);
                        }
                        
                        Expense updatedExpense = expenseRepository.save(expense);
                        System.out.println("=== Expense updated successfully ===");
                        return ResponseEntity.ok(updatedExpense);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("=== Error updating expense ===");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating expense: " + e.getMessage());
        }
    }

    // Delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        try {
            if (expenseRepository.existsById(id)) {
                expenseRepository.deleteById(id);
                System.out.println("=== Expense deleted: " + id + " ===");
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "Expense deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("=== Error deleting expense ===");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting expense: " + e.getMessage());
        }
    }
}