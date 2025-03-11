const API_URL = "http://localhost:5000";

// Handle form submission
document.getElementById("expenseForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let expenseName = document.getElementById("expenseName").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let category = document.getElementById("category").value;
    let expenseType = document.getElementById("expenseType").value;
    let date = document.getElementById("date").value;

    await fetch(`${API_URL}/add_expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseName, amount, category, expenseType, date })
    });

    loadExpenses();
    document.getElementById("expenseForm").reset();
});

// Load expenses 
async function loadExpenses() {
    let response = await fetch(`${API_URL}/get_expenses`);
    let expenses = await response.json();
    let tableBody = document.getElementById("expenseTable");
    tableBody.innerHTML = "";

    let totalSpending = 0;
    let categorySpendings = {};

    expenses.forEach((expense, index) => {
        let row = tableBody.insertRow();
        row.insertCell(0).innerText = expense.expenseName || "Unknown";
        row.insertCell(1).innerText = "$" + expense.amount;
        row.insertCell(2).innerText = expense.category;
        row.insertCell(3).innerText = expense.expenseType;
        row.insertCell(4).innerText = expense.date;

        let deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🗑 Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = function () {
            deleteExpense(index);
        };
        row.insertCell(5).appendChild(deleteBtn);

        totalSpending += parseFloat(expense.amount);

        if (categorySpendings[expense.category]) {
            categorySpendings[expense.category] += parseFloat(expense.amount);
        } else {
            categorySpendings[expense.category] = parseFloat(expense.amount);
        }
    });

    updateAITip(totalSpending, categorySpendings);
}

// AI-powered smart suggestions (We are still working on it)
function updateAITip(totalSpending, categorySpendings) {
    let aiTip = document.getElementById("aiTip");
    let highestCategory = Object.keys(categorySpendings).reduce((a, b) => categorySpendings[a] > categorySpendings[b] ? a : b, "None");

    if (totalSpending > 5000) {
        aiTip.innerHTML = `🔥 You're spending a lot! Try setting a **monthly budget**.`;
    } else if (highestCategory === "Subscriptions") {
        aiTip.innerHTML = `💡 Consider canceling **unused subscriptions** like streaming services. <a href="https://www.justuseapp.com" target="_blank">Click here</a> to find & cancel them.`;
    } else if (highestCategory === "Food") {
        aiTip.innerHTML = `🍔 Food expenses are high! Try **meal prepping** to save money.`;
    } else if (highestCategory === "Shopping") {
        aiTip.innerHTML = `🛍 Reduce impulse purchases! Try using a **wishlist** instead of buying immediately.`;
    } else {
        aiTip.innerHTML = `Your spending is under control! Keep tracking your expenses.`;
    }
}

//  Handle delete expense
async function deleteExpense(index) {
    await fetch(`${API_URL}/delete_expense/${index}`, { method: "DELETE" });
    loadExpenses();
}

//  Export Button
document.getElementById("exportCSV").addEventListener("click", function() {
    window.location.href = `${API_URL}/download_csv`;
});

loadExpenses();
