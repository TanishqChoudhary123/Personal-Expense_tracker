const defaultExpenses = [
  { id: 1, description: "Shopping", amount: 1500, category: "Shopping" },
  { id: 2, description: "Present", amount: 700, category: "Shopping" },
  { id: 3, description: "Train", amount: 500, category: "Transport" },
  { id: 4, description: "Hidji", amount: 25, category: "Travel" }
];

let expenses = loadExpenses();

const form = document.getElementById("expenseForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expenseList");
const categoryFilter = document.getElementById("categoryFilter");
const successMessage = document.getElementById("successMessage");

function loadExpenses() {
  const saved = localStorage.getItem("personalExpenses");
  if (!saved) return [...defaultExpenses];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...defaultExpenses];
  } catch {
    return [...defaultExpenses];
  }
}

function saveExpenses() {
  localStorage.setItem("personalExpenses", JSON.stringify(expenses));
}

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function render() {
  const filter = categoryFilter.value;
  const visibleExpenses = filter === "All"
    ? expenses
    : expenses.filter((expense) => expense.category === filter);

  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  document.getElementById("totalSpent").textContent = formatCurrency(total);
  document.getElementById("transactionCount").textContent = expenses.length;
  document.getElementById("expenseCount").textContent =
    expenses.length === 1 ? "Expense, added" : "Expenses, added";

  if (visibleExpenses.length === 0) {
    expenseList.innerHTML = '<div class="empty-state">No expenses in this category</div>';
    return;
  }

  expenseList.innerHTML = visibleExpenses.map((expense) => `
    <article class="expense-item">
      <div class="expense-info">
        <strong>${escapeHtml(expense.description)}</strong>
        <span>${escapeHtml(expense.category)}</span>
      </div>
      <div class="expense-amount">${formatCurrency(expense.amount)}</div>
      <button class="delete-button" type="button" data-id="${expense.id}" aria-label="Delete ${escapeHtml(expense.description)}">×</button>
    </article>
  `).join("");
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!description || !amount || amount <= 0 || !category) return;

  expenses.unshift({
    id: Date.now(),
    description,
    amount,
    category
  });

  saveExpenses();
  form.reset();
  categoryFilter.value = "All";
  render();

  successMessage.classList.add("visible");
  window.setTimeout(() => successMessage.classList.remove("visible"), 1800);
});

categoryFilter.addEventListener("change", render);

expenseList.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");
  if (!button) return;

  expenses = expenses.filter((expense) => expense.id !== Number(button.dataset.id));
  saveExpenses();
  render();
});

render();