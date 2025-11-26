package jpademo.jpademo.model.repository;

import jpademo.jpademo.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByUserId(Long userId);
    
    // Add this method
    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);
}