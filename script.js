let students = [];

try {
students = JSON.parse(localStorage.getItem("students")) || [];
} catch (error) {
students = [];
}

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

const duplicate = students.some(function(student) {
    return student.roll === roll;
});

if (duplicate) {
    alert("This roll number already exists!");
    return;
}

students.push({
    name: name,
    roll: roll,
    attendance: []
});

saveData();

nameInput.value = "";
rollInput.value = "";

displayStudents();
alert("Student added successfully!");

}

function markAttendance(roll, status) {
const student = students.find(function(item) {
return item.roll === roll;
});

if (!student) return;

const today = new Date().toLocaleDateString("en-CA");
const records = student.attendance;

const existing = records.find(function(record) {
    return record.date === today;
});

if (existing) {
    existing.status = status;
} else {
    records.push({
        date: today,
        status: status
    });
}

saveData();
displayStudents();

}

function deleteStudent(roll) {
if (!confirm("Do you want to delete this student?")) {
return;
}

students = students.filter(function(student) {
    return student.roll !== roll;
});

saveData();
displayStudents();

}

function displayStudents() {
const tableBody = document.getElementById("studentList");
const searchInput = document.getElementById("searchInput");
const summary = document.getElementById("summary");

if (!tableBody) return;

const search = searchInput.value.trim().toLowerCase();

tableBody.innerHTML = "";

const filteredStudents = students.filter(function(student) {
    return student.name.toLowerCase().includes(search) ||
           student.roll.toLowerCase().includes(search);
});

filteredStudents.forEach(function(student) {
    const today = new Date().toLocaleDateString("en-CA");

    const todayRecord = student.attendance.find(function(record) {
        return record.date === today;
    });

    const presentCount = student.attendance.filter(function(record) {
        return record.status === "Present";
    }).length;

    const totalDays = student.attendance.length;

    const percentage = totalDays > 0
        ? ((presentCount / totalDays) * 100).toFixed(1)
        : "0.0";

    const row = document.createElement("tr");

    const rollCell = document.createElement("td");
    rollCell.textContent = student.roll;

    const nameCell = document.createElement("td");
    nameCell.textContent = student.name;

    const attendanceCell = document.createElement("td");
    attendanceCell.textContent = todayRecord
        ? todayRecord.status
        : "Not marked";

    const percentageCell = document.createElement("td");
    percentageCell.textContent = percentage + "%";

    const actionsCell = document.createElement("td");

    const presentButton = document.createElement("button");
    presentButton.textContent = "Present";
    presentButton.onclick = function() {
        markAttendance(student.roll, "Present");
    };

    const absentButton = document.createElement("button");
    absentButton.textContent = "Absent";
    absentButton.onclick = function() {
        markAttendance(student.roll, "Absent");
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.onclick = function() {
        deleteStudent(student.roll);
    };

    actionsCell.appendChild(presentButton);
    actionsCell.appendChild(document.createTextNode(" "));
    actionsCell.appendChild(absentButton);
    actionsCell.appendChild(document.createTextNode(" "));
    actionsCell.appendChild(deleteButton);

    row.appendChild(rollCell);
    row.appendChild(nameCell);
    row.appendChild(attendanceCell);
    row.appendChild(percentageCell);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
});

summary.textContent = "Total Students: " + students.length;

}

function exportCSV() {
let csv = "Roll Number,Student Name,Date,Status\n";

students.forEach(function(student) {
    if (student.attendance.length === 0) {
        csv += '"' + student.roll + '","' +
            student.name.replace(/"/g, '""') +
            '","","Not marked"\n';
    } else {
        student.attendance.forEach(function(record) {
            csv += '"' + student.roll + '","' +
                student.name.replace(/"/g, '""') +
                '","' + record.date +
                '","' + record.status + '"\n';
        });
    }
});

const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
});

const url = URL.createObjectURL(blob);
const link = document.createElement("a");

link.href = url;
link.download = "attendance.csv";

document.body.appendChild(link);
link.click();
link.remove();

URL.revokeObjectURL(url);

}

document.addEventListener("DOMContentLoaded", displayStudents);
