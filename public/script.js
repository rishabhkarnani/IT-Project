import { db, ref, push, get, remove } from "./firebase.js";

const form = document.getElementById("expenseForm");
const table = document.getElementById("expenseTable");
const aiTip = document.getElementById("aiTip");
const expensesRef = ref(db, "expenses");

async function loadExpenses() {
  const snapshot = await get(expensesRef);
  table.innerHTML = "";
  let total = 0;
  let categoryTotals = {};

  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.entries(data).forEach(([id, exp]) => {
      total += parseFloat(exp.amount);
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + parseFloat(exp.amount);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${exp.expenseName}</td>
        <td>${exp.amount}</td>
        <td>${exp.category}</td>
        <td>${exp.expenseType}</td>
        <td>${exp.date}</td>
        <td><button onclick="deleteExpense('${id}')" style="background:red;color:white;">🗑 Delete</button></td>
      `;
      table.appendChild(row);
    });

    const [topCategory] = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    aiTip.textContent = total > 0 && topCategory[1] > 3000
      ? `⚠️ You're spending a lot on ${topCategory[0]}. Try to cut back.`
      : "✅ Your spending looks under control! Keep it up!";
  }
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    expenseName: document.getElementById("expenseName").value,
    amount: document.getElementById("amount").value,
    category: document.getElementById("category").value,
    expenseType: document.getElementById("expenseType").value,
    date: document.getElementById("date").value,
  };

  if (!data.expenseName || !data.amount || !data.category || !data.expenseType || !data.date) {
    alert("Please fill all fields!");
    return;
  }

  await push(expensesRef, data);
  form.reset();
  loadExpenses();
});

window.deleteExpense = async (id) => {
  await remove(ref(db, `expenses/${id}`));
  loadExpenses();
};

loadExpenses();
