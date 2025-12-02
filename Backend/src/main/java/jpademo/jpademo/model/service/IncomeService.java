package jpademo.jpademo.model.service;

import jpademo.jpademo.model.Income;
import jpademo.jpademo.model.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    public List<Income> getIncomesByUser(Long userId) {
        return incomeRepository.findByUserIdOrderByIncomeDateDesc(userId);
    }

    public BigDecimal getTotalIncome(Long userId) {
        List<Income> incomes = incomeRepository.findByUserIdOrderByIncomeDateDesc(userId);
        return incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Income createIncome(Income income) {
        return incomeRepository.save(income);
    }

    public Income updateIncome(Long id, Income income) {
        income.setId(id);
        return incomeRepository.save(income);
    }

    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }
}