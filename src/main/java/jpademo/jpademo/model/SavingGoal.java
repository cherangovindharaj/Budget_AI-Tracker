package jpademo.jpademo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "saving_goals")
public class SavingGoal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "goal_name")
    private String goalName;
    
    @Column(name = "target_amount")
    private Double targetAmount;
    
    @Column(name = "saved_amount")
    private Double savedAmount;
    
    @Column(name = "deadline")
    private String deadline;
    
    // Default Constructor
    public SavingGoal() {
        this.savedAmount = 0.0;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getGoalName() {
        return goalName;
    }
    
    public void setGoalName(String goalName) {
        this.goalName = goalName;
    }
    
    public Double getTargetAmount() {
        return targetAmount;
    }
    
    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }
    
    public Double getSavedAmount() {
        return savedAmount;
    }
    
    public void setSavedAmount(Double savedAmount) {
        this.savedAmount = savedAmount;
    }
    
    public String getDeadline() {
        return deadline;
    }
    
    public void setDeadline(String deadline) {
        this.deadline = deadline;
    }
}