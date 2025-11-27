import React, { useState, useEffect } from "react";

const SavingGoal = ({ userId, balance }) => {
  const [goal, setGoal] = useState(null);
  const [inputGoal, setInputGoal] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/api/saving-goal/${userId}`)
      .then(res => res.json())
      .then(data => setGoal(data));
  }, [userId]);

  const setSavingGoal = async () => {
    const response = await fetch("http://localhost:8080/api/saving-goal/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, goalAmount: inputGoal, savedAmount: balance })
    });

    const data = await response.json();
    setGoal(data);
  };

  if (!goal) {
    return (
      <div className="bg-white p-4 rounded-xl shadow border">
        <h3 className="text-lg font-semibold mb-3">Set Saving Goal</h3>
        <input 
          type="number"
          placeholder="Enter Goal Amount"
          className="border p-2 rounded w-full mb-2"
          value={inputGoal}
          onChange={(e) => setInputGoal(e.target.value)}
        />
        <button 
          onClick={setSavingGoal}
          className="bg-purple-600 text-white px-4 py-2 rounded w-full">
          Save Goal
        </button>
      </div>
    );
  }

  const progress = ((balance / goal.goalAmount) * 100).toFixed(1);

  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="text-lg font-bold mb-2">Saving Goal Progress</h3>
      <p className="text-gray-600">Goal: ₹{goal.goalAmount}</p>
      <p className="text-gray-600">Saved: ₹{balance}</p>

      <div className="w-full bg-gray-200 h-4 rounded mt-3">
        <div className="bg-green-500 h-full rounded" style={{ width: `${progress}%` }}></div>
      </div>

      <p className="text-right text-sm mt-1 text-green-700">{progress}% reached</p>
    </div>
  );
};

export default SavingGoal;
