// ... import and setup
import { db, ref, push, get, remove, update } from './firebase.js';

const expenseForm = document.getElementById("expenseForm");
const table = document.getElementById("expenseTable");
const expensesRef = ref(db, "expenses/");
const chartSection = document.querySelector(".chart-section");
let allExpenses = {};

function validateName(name) {
  return /^[A-Za-z\s]+$/.test(name);
}

async function loadExpenses(filtered = false) {
  const snapshot = await get(expensesRef);
  table.innerHTML = "";
  allExpenses = {};
  let total = 0;
  let filteredCount = 0;

  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.entries(data).forEach(([id, exp]) => {
      allExpenses[id] = exp;

      const selectedCategory = document.getElementById("filterCategory").value;
      const selectedType = document.getElementById("filterType").value;

      const categoryMatch = selectedCategory === "" || exp.category === selectedCategory;
      const typeMatch = selectedType === "" || exp.expenseType === selectedType;

      if (!categoryMatch || !typeMatch) return;

      filteredCount++;
      total += parseFloat(exp.amount);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exp.expenseName}</td>
        <td>₹${exp.amount}</td>
        <td>${exp.category}</td>
        <td>${exp.expenseType}</td>
        <td>${exp.date}</td>
        <td>
          <button onclick="editExpense('${id}')" class="edit-btn">✏️</button>
          <button onclick="deleteExpense('${id}')" class="delete-btn">🗑️</button>
        </td>
      `;

      row.addEventListener("click", (e) => {
        if (!["BUTTON", "svg", "path"].includes(e.target.tagName)) {
          showAnalyticsModal(exp);
        }
      });

      table.appendChild(row);
    });
  }

  document.getElementById("totalExpense").textContent = total;
  document.getElementById("monthlyEstimate").textContent = (total / 30).toFixed(2);

  // Hide chart if nothing is shown
  chartSection.style.display = filteredCount > 0 ? "block" : "none";
}

expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("expenseName").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("expenseType").value;
  const date = document.getElementById("date").value;

  if (!validateName(name)) return alert("❌ Name must contain only letters.");
  if (isNaN(amount) || amount <= 0) return alert("❌ Enter a valid amount.");

  const id = expenseForm.dataset.editId;
  const data = { expenseName: name, amount, category, expenseType: type, date };

  if (id) {
    await update(ref(db, `expenses/${id}`), data);
    delete expenseForm.dataset.editId;
  } else {
    await push(expensesRef, data);
  }

  expenseForm.reset();
  loadExpenses();
});

document.getElementById("filterCategory").addEventListener("change", () => loadExpenses(true));
document.getElementById("filterType").addEventListener("change", () => loadExpenses(true));
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("filterCategory").value = "";
  document.getElementById("filterType").value = "";
  loadExpenses();
});

window.deleteExpense = async (id) => {
  if (confirm("Delete this expense?")) {
    await remove(ref(db, `expenses/${id}`));
    loadExpenses();
  }
};

window.editExpense = (id) => {
  const exp = allExpenses[id];

  const modal = document.createElement("div");
  modal.className = "modal analytics-modal";

  modal.innerHTML = `
    <div class="modal-content analytics-popup">
      <h3>✏️ Edit Expense: <span style="color:#ffc107">${exp.expenseName}</span></h3>
      <hr style="border-color: #444; margin-bottom: 16px;" />
      
      <form id="editForm">
        <input type="text" id="editName" placeholder="Name" value="${exp.expenseName}" required />
        <input type="number" id="editAmount" placeholder="Amount" value="${exp.amount}" required />
        
        <select id="editCategory" required>
          ${["Food", "Transport", "Entertainment", "Shopping", "Health", "Utilities", "Investment", "Education", "Gifts & Donations", "Other"]
            .map(cat => `<option value="${cat}" ${cat === exp.category ? "selected" : ""}>${cat}</option>`)
            .join("")}
        </select>

        <select id="editType" required>
          <option value="Fixed" ${exp.expenseType === "Fixed" ? "selected" : ""}>Fixed</option>
          <option value="Variable" ${exp.expenseType === "Variable" ? "selected" : ""}>Variable</option>
        </select>

        <input type="date" id="editDate" value="${exp.date}" required />

        <button type="submit" class="add-btn">💾 Save Changes</button>
        <button type="button" class="close-btn" onclick="document.querySelector('.analytics-modal').remove()">❌ Cancel</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedData = {
      expenseName: document.getElementById("editName").value.trim(),
      amount: parseFloat(document.getElementById("editAmount").value),
      category: document.getElementById("editCategory").value,
      expenseType: document.getElementById("editType").value,
      date: document.getElementById("editDate").value
    };

    await update(ref(db, `expenses/${id}`), updatedData);
    modal.remove();
    loadExpenses();
  });
};


function showAnalyticsModal(expense) {
  const dayOfWeek = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long' });
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const modal = document.createElement("div");
  modal.className = "modal analytics-modal";

  modal.innerHTML = `
    <div class="modal-content analytics-popup">
      <h3>📊 Detailed Insights: <span style="color:#ffc107">${expense.expenseName}</span></h3>
      <hr style="border-color: #444; margin-bottom: 16px;" />
      <p><strong>📌 Expense ID:</strong> <code style="color:#bbb;">(auto-generated)</code></p>
      <p><strong>💰 Amount:</strong> ₹${expense.amount}</p>
      <p><strong>📂 Category:</strong> ${expense.category}</p>
      <p><strong>📉 Type:</strong> ${expense.expenseType}</p>
      <p><strong>📅 Date:</strong> ${expense.date} (${dayOfWeek})</p>
      <p><strong>🕓 Time Logged:</strong> ${now}</p>
      <p><strong>🔁 Monthly?</strong> ${expense.expenseType === "Fixed" ? "Yes (Auto-assumed)" : "No"}</p>

      <canvas id="analyticsChart" width="360" height="200" style="margin: 15px 0;"></canvas>

      <div class="suggestion-box">
        <span class="emoji">💡</span>
        <span class="suggestion-text">${generateTip(expense)}</span>
      </div>

      <button class="close-btn" onclick="document.querySelector('.analytics-modal').remove()">❌ Close</button>
    </div>
  `;

  document.body.appendChild(modal);
  drawChart(expense);
}


function generateTip(exp) {
  if (exp.category === "Shopping" || exp.category === "Entertainment") {
    return "🛍 Tip: Try keeping fun expenses under 10% of your monthly income.";
  }
  if (exp.amount > 5000) {
    return "💸 This is a large spend. Consider splitting or reviewing this.";
  }
  return "✅ Great! This expense seems well within a healthy range.";
}

function drawChart(exp) {
  const ctx = document.getElementById("analyticsChart").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Your Expense", "Suggested Max"],
      datasets: [{
        data: [exp.amount, 3000],
        backgroundColor: ["#ff6384", "#36a2eb"]
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      }
    }
  });
}

loadExpenses();
