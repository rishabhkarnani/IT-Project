// Import Firebase functions and references from the firebase.js module
import { db, ref, push, get, remove } from "./firebase.js";

// Get DOM elements
const form = document.getElementById("expenseForm");
const table = document.getElementById("expenseTable");
const aiTip = document.getElementById("aiTip");

// Reference to the "expenses" node in Firebase Realtime Database
const expensesRef = ref(db, "expenses");

// Function to load and display expenses from Firebase
async function loadExpenses() {
  const snapshot = await get(expensesRef); // Get data snapshot from DB
  table.innerHTML = ""; // Clear existing table data
  let total = 0; // Total amount of all expenses
  let categoryTotals = {}; // Store totals by category

  if (snapshot.exists()) {
    const data = snapshot.val(); // Get actual data from snapshot

    // Loop through each expense entry
    Object.entries(data).forEach(([id, exp]) => {
      total += parseFloat(exp.amount); // Add to total
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount); // Track by category

      // Create a row for each expense
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exp.expenseName}</td>
        <td>${exp.amount}</td>
        <td>${exp.category}</td>
        <td>${exp.expenseType}</td>
        <td>${exp.date}</td>
        <td><button onclick="deleteExpense('${id}')" style="background:red;color:white;">🗑 Delete</button></td>
      `;
      table.appendChild(row); // Add row to table
    });

    // Show AI tip based on category spending
    const [topCategory] = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    aiTip.textContent = total > 0 && topCategory[1] > 3000
      ? `⚠️ You're spending a lot on ${topCategory[0]}. Try to cut back.`
      : "✅ Your spending looks under control! Keep it up!";
  }
}

// Handle form submission to add new expense
form?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form submission

  // Get input values
  const data = {
    expenseName: document.getElementById("expenseName").value,
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value,
    expenseType: document.getElementById("expenseType").value,
    date: document.getElementById("date").value,
  };

  // Validate all fields are filled
  if (!data.expenseName || !data.amount || !data.category || !data.expenseType || !data.date) {
    alert("Please fill all fields!");
    return;
  }

  // Push the new expense to Firebase
  await push(expensesRef, data);

  // Reset the form and reload the expense list
  form.reset();
  loadExpenses();
});

// Function to delete an expense by ID
window.deleteExpense = async (id) => {
  await remove(ref(db, `expenses/${id}`)); // Remove expense from Firebase
  loadExpenses(); // Reload the updated list
};

// Initial load of expenses when the page loads
loadExpenses();
