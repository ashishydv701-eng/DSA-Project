let fifoOrder = [];
let priorityOrder = [];

// Update severity display
document.getElementById("severity").oninput = function () {
  document.getElementById("sevValue").innerText = this.value;
};

// Add Patient
async function addPatient() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const disease = document.getElementById("disease").value;
  const severity = document.getElementById("severity").value;

  if (!name || !age || !disease) {
    alert("Please fill all fields");
    return;
  }

  await fetch("https://lay-poetry-supervision-kit.trycloudflare.com/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      age,
      disease,
      severity
    })
  });

  loadPatients();

  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("disease").value = "";
  document.getElementById("severity").value = 5;
  document.getElementById("sevValue").innerText = 5;
}

// Load Patients
async function loadPatients() {
  const res = await fetch("https://lay-poetry-supervision-kit.trycloudflare.com/patients");
  const data = await res.json();

  const list = document.getElementById("patientList");
  list.innerHTML = "";

  data.forEach(p => {
    let li = document.createElement("li");

    if (p.severity <= 3) li.className = "low";
    else if (p.severity <= 7) li.className = "medium";
    else li.className = "high";

    li.innerHTML = `
      <strong>${p.name}</strong> (Age: ${p.age})<br>
      Disease: ${p.disease}<br>
      Severity: ${p.severity}
    `;

    list.appendChild(li);
  });
}

// Treat FIFO
async function treatFIFO() {
  const res = await fetch("https://lay-poetry-supervision-kit.trycloudflare.com/treat/fifo");
  const data = await res.json();

  fifoOrder.push(data.name);
  document.getElementById("fifoOrder").innerText =
    fifoOrder.join(" → ");

  loadPatients();
}

// Treat Priority
async function treatPriority() {
  const res = await fetch("https://lay-poetry-supervision-kit.trycloudflare.com/treat/priority");
  const data = await res.json();

  priorityOrder.push(data.name);
  document.getElementById("priorityOrder").innerText =
    priorityOrder.join(" → ");

  loadPatients();
}

// Initial Load
loadPatients();
