package jpademo.jpademo.model.service;

import jpademo.jpademo.model.Expense;
import jpademo.jpademo.model.Income;
import jpademo.jpademo.model.repository.ExpenseRepository;
import jpademo.jpademo.model.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class BalanceService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public BigDecimal getAvailableBalance(Long userId) {
        // Calculate total income
        List<Income> incomes = incomeRepository.findByUserIdOrderByIncomeDateDesc(userId);
        BigDecimal totalIncome = BigDecimal.ZERO;
        for (Income income : incomes) {
            totalIncome = totalIncome.add(income.getAmount());
        }

        // Calculate total expenses (includes all expenses + savings as expenses)
        List<Expense> expenses = expenseRepository.findByUserIdOrderByExpenseDateDesc(userId);
        BigDecimal totalExpenses = BigDecimal.ZERO;
        for (Expense expense : expenses) {
            totalExpenses = totalExpenses.add(expense.getAmount());
        }

        // Available = Income - Expenses
        // Note: Savings are already included in expenses with category "Savings"
        // So we don't need to subtract totalSaved separately
        return totalIncome.subtract(totalExpenses);
    }

    public boolean hasEnoughBalance(Long userId, Double amount) {
        BigDecimal available = getAvailableBalance(userId);
        return available.compareTo(BigDecimal.valueOf(amount)) >= 0;
    }
}