let students = JSON.parse(localStorage.getItem("students")) || [];

function saveData() {
localStorage.setItem("students", JSON.stringify(students));
}

function addStudent() {
const nameInput = document.getElementById("studentName");
const rollInput = document.getElementById("rollNumber");

const name = nameInput.value.trim();
const roll = rollInput.value.trim();

if (name === "" || roll === "") {
    alert("Please enter both student name and roll number.");
    return;
}

if (students.some(student => student.roll === roll)) {
    alert("This roll number already exists.");
    return;
}

students.push({
    name: name,
    roll: roll,
    attendance: [],
});

saveData();
nameInput.value = "";
rollInput.value = "";
displayStudents();

}

function markAttendance(roll, status) {
const student = students.find(student => student.roll === roll);

if (!student) return;

const today = new Date().toISOString().split("T")[0];
const existing = student.attendance.findIndex(
    record => record.date === today
);

if (existing !== -1) {
    student.attendance[existing].status = status;
} else {
    student.attendance.push({
        date: today,
        status: status,
    });
}

saveData();
displayStudents();

}

function deleteStudent(roll) {
if (!confirm("Are you sure you want to delete this student?")) {
return;
}

students = students.filter(student => student.roll !== roll);
saveData();
displayStudents();

}

function displayStudents() {
const tableBody = document.getElementById("studentList");
const searchInput = document.getElementById("searchInput");

if (!tableBody) return;

const search = searchInput ? searchInput.value.toLowerCase() : "";
tableBody.innerHTML = "";

students
    .filter(student =>
        student.name.toLowerCase().includes(search) ||
        student.roll.toLowerCase().includes(search)
    )
    .forEach(student => {
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = student.attendance.find(
            record => record.date === today
        );

        const presentCount = student.attendance.filter(
            record => record.status === "Present"
        ).length;

        const totalDays = student.attendance.length;
        const percentage = totalDays
            ? ((presentCount / totalDays) * 100).toFixed(1)
            : "0.0";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${todayRecord ? todayRecord.status : "Not marked"}</td>
            <td>${percentage}%</td>
            <td>
                <button onclick="markAttendance('${student.roll}', 'Present')">
                    Present
                </button>
                <button onclick="markAttendance('${student.roll}', 'Absent')">
                    Absent
                </button>
                <button class="delete-btn" onclick="deleteStudent('${student.roll}')">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

const summary = document.getElementById("summary");

if (summary) {
    summary.textContent = "Total Students: " + students.length;
}

}

function escapeHTML(text) {
return text.replace(/[&<>"']/g, function (character) {
const characters = {
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
};

    return characters[character];
});

}

function exportCSV() {
let csv = "Roll Number,Student Name,Date,Status\n";

students.forEach(student => {
    if (student.attendance.length === 0) {
        csv += `"${student.roll}","${student.name}","","Not marked"\n`;
    } else {
        student.attendance.forEach(record => {
            csv += `"${student.roll}","${student.name}","${record.date}","${record.status}"\n`;
        });
    }
});

const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
});

const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "attendance.csv";
link.click();

URL.revokeObjectURL(link.href);

}

document.addEventListener("DOMContentLoaded", displayStudents);
