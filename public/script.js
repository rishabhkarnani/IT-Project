const API_URL = "http://localhost:5000";

// Handle form submission
document.getElementById("expenseForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("expenseName").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const type = document.getElementById("expenseType").value;
    const date = document.getElementById("date").value;

    try {
        const res = await fetch("/add-expense", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount, category, type, date }),
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            document.getElementById("expenseForm").reset();
            loadExpenses(); // If this updates the UI
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Failed to save expense. Please try again.");
    }
});

//Load and show expenses
async function loadExpenses() {
    const res = await fetch("/expenses");
    const expenses = await res.json();

    console.log("Expenses from server:", expenses);

    const tableBody = document.getElementById("expenseTable");
    tableBody.innerHTML = "";

    expenses.forEach((exp, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${exp.Name}</td>
            <td>${exp.Amount}</td>
            <td>${exp.Category}</td>
            <td>${exp.Type}</td>
            <td>${exp.Date}</td>
            <td>
                <button class="btn delete-btn" onclick="deleteExpense(${index})">❌ Delete</button>
            </td>
        `;

        tableBody.appendChild(row);

    
    });
}

//Loads expenses on page load.
document.addEventListener("DOMContentLoaded", () => {
    loadExpenses();
});

//Deletes an expense
async function deleteExpense(index) {
    const confirmed = confirm("Are you sure you want to delete this expense?");
    if (!confirmed) return;

    try {
        const res = await fetch(`/delete-expense/${index}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            loadExpenses();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Failed to delete expense.");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadExpenses();
});

//Logout button.
document.getElementById("logoutBtn").addEventListener("click", () => {
    fetch("/logout")
        .then(() => {
            window.location.href = "/login.html";
        })
        .catch(() => {
            alert("Logout failed");
        });
});

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
    await fetch(`${API_URL}/delete-expense/${index}`, { method: "DELETE" });
    loadExpenses();
}

//  Export Button
document.getElementById("exportCSV").addEventListener("click", () => {
    window.location.href = "/export";
});

loadExpenses();

