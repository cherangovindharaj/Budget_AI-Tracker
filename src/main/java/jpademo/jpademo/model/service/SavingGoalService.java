package jpademo.jpademo.model.service;

import jpademo.jpademo.model.Expense;
import jpademo.jpademo.model.SavingGoal;
import jpademo.jpademo.model.repository.ExpenseRepository;
import jpademo.jpademo.model.repository.SavingGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SavingGoalService {
    
    @Autowired
    private SavingGoalRepository repo;
    
    @Autowired
    private BalanceService balanceService;
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    public List<SavingGoal> getGoalsByUser(Long userId) {
        return repo.findByUserId(userId);
    }
    
    @Transactional
    public SavingGoal createGoal(SavingGoal goal) {
        if (goal.getSavedAmount() == null) {
            goal.setSavedAmount(0.0);
        }
        
        // If initial amount provided, check balance and create expense
        if (goal.getSavedAmount() > 0) {
            if (!balanceService.hasEnoughBalance(goal.getUserId(), goal.getSavedAmount())) {
                throw new RuntimeException("Insufficient balance. Available: ₹" + 
                    balanceService.getAvailableBalance(goal.getUserId()));
            }
            
            // Create expense entry for initial savings amount
            createSavingsExpense(goal.getUserId(), goal.getSavedAmount(), 
                "Initial savings for: " + goal.getGoalName());
        }
        
        return repo.save(goal);
    }
    
    @Transactional
    public SavingGoal addAmount(Long id, Double amount) {
        SavingGoal goal = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Saving goal not found"));
        
        // Check if user has enough balance
        if (!balanceService.hasEnoughBalance(goal.getUserId(), amount)) {
            throw new RuntimeException("Insufficient balance. Available: ₹" + 
                balanceService.getAvailableBalance(goal.getUserId()));
        }
        
        // Update saved amount
        Double current = goal.getSavedAmount();
        if (current == null) current = 0.0;
        goal.setSavedAmount(current + amount);
        
        // Create expense entry to deduct from balance
        createSavingsExpense(goal.getUserId(), amount, 
            "Savings added to: " + goal.getGoalName());
        
        return repo.save(goal);
    }
    
    public void deleteGoal(Long id) {
        repo.deleteById(id);
    }
    
    /**
     * Creates an expense entry for savings
     * This will automatically reduce the user's balance
     */
    private void createSavingsExpense(Long userId, Double amount, String description) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setAmount(BigDecimal.valueOf(amount));
        expense.setCategory("Savings");
        expense.setDescription(description);
        expense.setExpenseDate(LocalDate.now());
        
        expenseRepository.save(expense);
    }
}