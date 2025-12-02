package jpademo.jpademo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jpademo.jpademo.model.service.AIService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * 1. Get personalized expense tips based on spending patterns
     * Request: [{"category":"Food","amount":12000}, {"category":"Transport","amount":5000}]
     * Response: {"type":"expense_tips", "tips":[...], "status":"success"}
     */
    @PostMapping("/expense-tips")
    public ResponseEntity<Map<String, Object>> getExpenseTips(@RequestBody List<Map<String, Object>> expenses) {
        Map<String, Object> response = aiService.generateExpenseTips(expenses);
        return ResponseEntity.ok(response);
    }

    /**
     * 2. Get budget suggestions using 50-30-20 rule
     * Request: {"income": 50000, "expenses": 35000, "topCategories": ["Food", "Transport"]}
     * Response: {"suggestedBudget":{...}, "healthStatus":"Good", "recommendations":[...], "potentialSavings":15000}
     */
    @PostMapping("/budget-suggestion")
    public ResponseEntity<Map<String, Object>> getBudgetSuggestion(@RequestBody Map<String, Object> request) {
        Map<String, Object> suggestion = aiService.generateBudgetSuggestion(request);
        return ResponseEntity.ok(suggestion);
    }

    /**
     * 3. Get monthly financial analytics and health assessment
     * Request: {"totalIncome":50000, "totalExpenses":35000, "categoryBreakdown":{"Food":12000}}
     * Response: {"financialHealth":"Good", "insights":[...], "trends":{...}, "netSavings":15000}
     */
    @PostMapping("/monthly-analytics")
    public ResponseEntity<Map<String, Object>> getMonthlyAnalytics(@RequestBody Map<String, Object> request) {
        Map<String, Object> analytics = aiService.generateMonthlyAnalytics(request);
        return ResponseEntity.ok(analytics);
    }

    /**
     * 4. Get spending alerts and warnings
     * Request: {"weeklySpending":8000, "monthlyBudget":30000, "daysRemaining":20}
     * Response: {"alertLevel":"Warning", "messages":[...], "projectedSpending":32000, "remainingBudget":-2000}
     */
    @PostMapping("/spending-alerts")
    public ResponseEntity<Map<String, Object>> getSpendingAlerts(@RequestBody Map<String, Object> request) {
        Map<String, Object> alert = aiService.generateSpendingAlert(request);
        return ResponseEntity.ok(alert);
    }

    /**
     * 5. Auto-suggest category based on description
     * Request: {"description": "Bought groceries from supermarket", "amount": 2500}
     * Response: {"suggestedCategory":"Food", "alternativeCategories":["Food","Shopping"], "confidence":85.0}
     */
    @PostMapping("/suggest-category")
    public ResponseEntity<Map<String, Object>> suggestCategory(@RequestBody Map<String, Object> request) {
        Map<String, Object> suggestion = aiService.suggestCategory(request);
        return ResponseEntity.ok(suggestion);
    }
}