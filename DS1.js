let patients = [];

const severitySlider = document.getElementById("severity");
const sevValue = document.getElementById("sevValue");

severitySlider.oninput = function () {
    sevValue.textContent = this.value;
};

function addPatient() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;
    const disease = document.getElementById("disease").value.trim();
    const severity = parseInt(document.getElementById("severity").value);

    if (!name || !age || !disease) {
        alert("Please fill all fields");
        return;
    }

    const patient = {
        name,
        age,
        disease,
        severity
    };

    patients.push(patient);

    renderPatients();

    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("disease").value = "";
    document.getElementById("severity").value = 5;
    sevValue.textContent = 5;
}

function renderPatients() {
    const patientList = document.getElementById("patientList");
    patientList.innerHTML = "";

    patients.forEach(patient => {
        const li = document.createElement("li");

        let severityClass = "low";
        if (patient.severity >= 8) severityClass = "high";
        else if (patient.severity >= 5) severityClass = "medium";

        li.classList.add(severityClass);

        li.innerHTML = `
            <strong>${patient.name}</strong> (Age: ${patient.age})<br>
            Disease: ${patient.disease}<br>
            Severity: ${patient.severity}
        `;

        patientList.appendChild(li);
    });
}

function treatFIFO() {
    if (patients.length === 0) {
        alert("No patients in queue");
        return;
    }

    const treated = patients.shift();

    document.getElementById("fifoOrder").textContent = treated.name;

    renderPatients();
}

function treatPriority() {
    if (patients.length === 0) {
        alert("No patients in queue");
        return;
    }

    let maxIndex = 0;

    for (let i = 1; i < patients.length; i++) {
        if (patients[i].severity > patients[maxIndex].severity) {
            maxIndex = i;
        }
    }

    const treated = patients.splice(maxIndex, 1)[0];

    document.getElementById("priorityOrder").textContent = treated.name;

    renderPatients();
}
