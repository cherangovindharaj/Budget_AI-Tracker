package jpademo.jpademo.model.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    private static final Map<String, List<String>> CATEGORY_KEYWORDS = new HashMap<>() {{
        put("Food", Arrays.asList("restaurant", "cafe", "food", "meal", "grocery", "supermarket", 
            "breakfast", "lunch", "dinner", "swiggy", "zomato", "hotel", "eat", "snack", "pizza", "biryani"));
        put("Transport", Arrays.asList("uber", "ola", "taxi", "cab", "bus", "metro", "train", 
            "fuel", "petrol", "diesel", "gas", "parking", "toll", "auto", "rapido"));
        put("Shopping", Arrays.asList("shop", "mall", "amazon", "flipkart", "clothes", "fashion", 
            "shoes", "electronics", "store", "purchase", "buy", "myntra", "meesho"));
        put("Bills", Arrays.asList("electricity", "water", "internet", "mobile", "recharge", 
            "wifi", "broadband", "bill", "payment", "utility", "rent", "emi"));
        put("Entertainment", Arrays.asList("movie", "cinema", "netflix", "spotify", "game", 
            "concert", "show", "theater", "fun", "party", "club", "prime", "hotstar"));
        put("Health", Arrays.asList("doctor", "hospital", "medicine", "pharmacy", "medical", 
            "clinic", "health", "gym", "fitness", "apollo", "yoga"));
        put("Education", Arrays.asList("book", "course", "class", "school", "college", "tuition", 
            "study", "training", "learning", "udemy", "coursera"));
    }};

    /**
     * 1. Generate personalized expense tips
     */
    public Map<String, Object> generateExpenseTips(List<Map<String, Object>> expenses) {
        List<String> tips = new ArrayList<>();
        
        double totalSpending = expenses.stream()
                .mapToDouble(e -> ((Number) e.get("amount")).doubleValue())
                .sum();

        // Sort by amount to find top spenders
        List<Map<String, Object>> sortedExpenses = expenses.stream()
                .sorted((a, b) -> Double.compare(
                    ((Number) b.get("amount")).doubleValue(),
                    ((Number) a.get("amount")).doubleValue()
                ))
                .collect(Collectors.toList());

        for (Map<String, Object> expense : sortedExpenses.subList(0, Math.min(3, sortedExpenses.size()))) {
            String category = (String) expense.get("category");
            double amount = ((Number) expense.get("amount")).doubleValue();
            double percentage = (amount / totalSpending) * 100;
            
            if (category.equalsIgnoreCase("Food") && percentage > 30) {
                tips.add("🍽️ Food expenses are high (" + String.format("%.1f%%", percentage) + 
                    "). Try meal planning and cooking at home to save ₹" + 
                    String.format("%.0f", amount * 0.3) + "/month");
            } else if (category.equalsIgnoreCase("Transport") && percentage > 20) {
                tips.add("🚗 Transport costs are above average. Consider carpooling or public transport to reduce by ₹" + 
                    String.format("%.0f", amount * 0.25));
            } else if (category.equalsIgnoreCase("Shopping") && percentage > 25) {
                tips.add("🛍️ Shopping expenses seem high. Set a monthly limit and use wishlists to avoid impulse buying");
            } else if (category.equalsIgnoreCase("Entertainment") && percentage > 15) {
                tips.add("🎬 Entertainment spending is elevated. Consider free alternatives or reduce subscriptions");
            }
        }

        if (tips.isEmpty()) {
            tips.add("✅ Great job! Your spending looks balanced across categories");
            tips.add("💡 Keep tracking your expenses to maintain this healthy pattern");
            tips.add("📊 Consider setting aside 20% of income for savings");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("type", "expense_tips");
        response.put("tips", tips);
        response.put("status", "success");
        response.put("totalAnalyzed", totalSpending);
        
        return response;
    }

    /**
     * 2. Generate budget suggestion using 50-30-20 rule
     */
    public Map<String, Object> generateBudgetSuggestion(Map<String, Object> request) {
        double income = ((Number) request.get("income")).doubleValue();
        double currentExpenses = ((Number) request.get("expenses")).doubleValue();
        
        // 50-30-20 Rule
        double needs = income * 0.50;  // Essentials
        double wants = income * 0.30;  // Lifestyle
        double savings = income * 0.20; // Savings/Investments

        Map<String, Double> suggestedBudget = new LinkedHashMap<>();
        suggestedBudget.put("Food", needs * 0.35);
        suggestedBudget.put("Transport", needs * 0.25);
        suggestedBudget.put("Bills", needs * 0.40);
        suggestedBudget.put("Shopping", wants * 0.50);
        suggestedBudget.put("Entertainment", wants * 0.30);
        suggestedBudget.put("Health", wants * 0.20);
        suggestedBudget.put("Savings", savings);

        String healthStatus;
        String healthEmoji;
        List<String> recommendations = new ArrayList<>();

        if (currentExpenses <= income * 0.70) {
            healthStatus = "Excellent";
            healthEmoji = "💚";
            recommendations.add(healthEmoji + " You're managing finances excellently!");
            recommendations.add("📈 Consider increasing savings to 25-30% of income");
            recommendations.add("💰 Look into investment options for long-term growth");
        } else if (currentExpenses <= income * 0.85) {
            healthStatus = "Good";
            healthEmoji = "💛";
            recommendations.add(healthEmoji + " Good financial health, but there's room for improvement");
            recommendations.add("💰 Try to reduce discretionary spending by 10%");
            recommendations.add("🎯 Focus on building an emergency fund");
        } else if (currentExpenses <= income) {
            healthStatus = "Fair";
            healthEmoji = "🧡";
            recommendations.add(healthEmoji + " You're spending most of your income");
            recommendations.add("⚠️ Prioritize essential expenses only");
            recommendations.add("📊 Review and cancel unnecessary subscriptions");
        } else {
            healthStatus = "Needs Attention";
            healthEmoji = "❤️";
            recommendations.add(healthEmoji + " You're spending more than you earn!");
            recommendations.add("🚨 Immediate action needed to reduce expenses");
            recommendations.add("🎯 Cut all non-essential spending immediately");
            recommendations.add("📞 Consider seeking financial counseling");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("suggestedBudget", suggestedBudget);
        response.put("healthStatus", healthStatus);
        response.put("healthEmoji", healthEmoji);
        response.put("recommendations", recommendations);
        response.put("potentialSavings", income - currentExpenses);
        response.put("savingsGoal", savings);
        response.put("currentSavingsRate", ((income - currentExpenses) / income) * 100);
        
        return response;
    }

    /**
     * 3. Generate monthly analytics
     */
    public Map<String, Object> generateMonthlyAnalytics(Map<String, Object> request) {
        double totalIncome = ((Number) request.get("totalIncome")).doubleValue();
        double totalExpenses = ((Number) request.get("totalExpenses")).doubleValue();
        
        @SuppressWarnings("unchecked")
        Map<String, Object> breakdownObj = (Map<String, Object>) request.get("categoryBreakdown");
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdownObj.forEach((k, v) -> breakdown.put(k, ((Number) v).doubleValue()));

        double savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
        double netSavings = totalIncome - totalExpenses;
        
        String financialHealth;
        String healthEmoji;
        if (savingsRate >= 20) {
            financialHealth = "Excellent";
            healthEmoji = "💚";
        } else if (savingsRate >= 10) {
            financialHealth = "Good";
            healthEmoji = "💛";
        } else if (savingsRate >= 0) {
            financialHealth = "Fair";
            healthEmoji = "🧡";
        } else {
            financialHealth = "Critical";
            healthEmoji = "❤️";
        }

        // Find highest spending category
        Map.Entry<String, Double> topEntry = breakdown.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);

        List<String> insights = new ArrayList<>();
        insights.add(healthEmoji + " Financial Health: " + financialHealth);
        insights.add("💰 Savings Rate: " + String.format("%.1f%%", savingsRate));
        
        if (topEntry != null) {
            double topPercentage = (topEntry.getValue() / totalExpenses) * 100;
            insights.add("📊 Top Category: " + topEntry.getKey() + " (₹" + 
                String.format("%.0f", topEntry.getValue()) + " - " + 
                String.format("%.1f%%", topPercentage) + ")");
        }
        
        if (savingsRate < 0) {
            insights.add("🚨 You're spending more than earning! Cut expenses immediately");
        } else if (savingsRate < 10) {
            insights.add("⚠️ Low savings rate. Aim for at least 20%");
        } else if (savingsRate < 20) {
            insights.add("🎯 Good progress! Try to reach 20% savings");
        } else {
            insights.add("⭐ Excellent savings! Keep it up!");
        }

        Map<String, Double> trends = new LinkedHashMap<>();
        trends.put("savingsRate", savingsRate);
        trends.put("expenseRatio", (totalExpenses / totalIncome) * 100);
        trends.put("netWorth", netSavings);

        Map<String, Object> response = new HashMap<>();
        response.put("financialHealth", financialHealth);
        response.put("healthEmoji", healthEmoji);
        response.put("insights", insights);
        response.put("trends", trends);
        response.put("netSavings", netSavings);
        response.put("categoryBreakdown", breakdown);
        
        return response;
    }

    /**
     * 4. Generate spending alerts
     */
    public Map<String, Object> generateSpendingAlert(Map<String, Object> request) {
        double weeklySpending = ((Number) request.get("weeklySpending")).doubleValue();
        double monthlyBudget = ((Number) request.get("monthlyBudget")).doubleValue();
        int daysRemaining = ((Number) request.get("daysRemaining")).intValue();

        // Project monthly spending based on weekly rate
        double projectedMonthly = weeklySpending * 4.33; // Average weeks per month
        double weeklyBudget = monthlyBudget / 4.33;
        double dailyBudget = monthlyBudget / 30;
        
        String alertLevel;
        String alertEmoji;
        List<String> messages = new ArrayList<>();

        if (projectedMonthly > monthlyBudget * 1.2) {
            alertLevel = "Critical";
            alertEmoji = "🚨";
            messages.add(alertEmoji + " CRITICAL: You're on track to exceed budget by " + 
                String.format("%.0f%%", ((projectedMonthly - monthlyBudget) / monthlyBudget * 100)));
            messages.add("🎯 Immediate action needed! Stop all non-essential spending");
            messages.add("💰 Daily limit: ₹" + 
                String.format("%.0f", Math.max(0, (monthlyBudget - (weeklySpending * 3)) / daysRemaining)));
        } else if (projectedMonthly > monthlyBudget) {
            alertLevel = "Warning";
            alertEmoji = "⚠️";
            messages.add(alertEmoji + " WARNING: Spending is above target pace");
            messages.add("📊 Projected overspending: ₹" + String.format("%.0f", projectedMonthly - monthlyBudget));
            messages.add("💡 Stay under ₹" + String.format("%.0f", weeklyBudget) + "/week to meet budget");
        } else {
            alertLevel = "On Track";
            alertEmoji = "✅";
            messages.add(alertEmoji + " Great! You're within budget");
            messages.add("💚 You can save ₹" + String.format("%.0f", monthlyBudget - projectedMonthly) + " this month");
            messages.add("📈 Keep daily spending under ₹" + String.format("%.0f", dailyBudget));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("alertLevel", alertLevel);
        response.put("alertEmoji", alertEmoji);
        response.put("messages", messages);
        response.put("projectedSpending", projectedMonthly);
        response.put("remainingBudget", monthlyBudget - projectedMonthly);
        response.put("weeklyBudget", weeklyBudget);
        response.put("dailyBudget", dailyBudget);
        
        return response;
    }

    /**
     * 5. Suggest category based on description
     */
    public Map<String, Object> suggestCategory(Map<String, Object> request) {
        String description = ((String) request.get("description")).toLowerCase();
        
        Map<String, Integer> categoryScores = new HashMap<>();

        // Calculate match scores for each category
        for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            int score = 0;
            for (String keyword : entry.getValue()) {
                if (description.contains(keyword)) {
                    score += 10;
                }
            }
            if (score > 0) {
                categoryScores.put(entry.getKey(), score);
            }
        }

        // Get top 3 suggestions
        List<String> suggestions = categoryScores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        String suggestedCategory = suggestions.isEmpty() ? "Other" : suggestions.get(0);
        
        if (suggestions.isEmpty()) {
            suggestions.add("Other");
            suggestions.add("Shopping");
            suggestions.add("Bills");
        }

        double confidence = suggestions.isEmpty() || suggestedCategory.equals("Other") ? 50.0 : 
            Math.min(95.0, categoryScores.getOrDefault(suggestedCategory, 0) * 8.5);

        Map<String, Object> response = new HashMap<>();
        response.put("suggestedCategory", suggestedCategory);
        response.put("alternativeCategories", suggestions);
        response.put("confidence", confidence);
        response.put("confidenceLabel", confidence >= 80 ? "High" : confidence >= 60 ? "Medium" : "Low");
        
        return response;
    }
}