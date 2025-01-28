let lists = JSON.parse(localStorage.getItem('lists')) || {};
let activeList = '';
let currentTableType = '';

function updateListSelector() {
  const listSelector = document.getElementById('list-selector');
  listSelector.innerHTML = '<option value="">-- Wybierz listę --</option>';
  for (const listName in lists) {
    const option = document.createElement('option');
    option.value = listName;
    option.textContent = listName;
    listSelector.appendChild(option);
  }
}

function createList() {
  const listName = document.getElementById('list-name').value.trim();
  const tableType = document.getElementById('table-type-selector').value;
  if (!listName) {
    alert('Wpisz nazwę listy!');
    return;
  }
  if (lists[listName]) {
    alert('Lista o takiej nazwie już istnieje!');
    return;
  }
  lists[listName] = { type: tableType, students: [] };
  localStorage.setItem('lists', JSON.stringify(lists));
  updateListSelector();
  alert(`Lista "${listName}" została utworzona!`);
}

function loadList() {
  const listSelector = document.getElementById('list-selector');
  activeList = listSelector.value;
  const tbody = document.getElementById('student-table').querySelector('tbody');
  tbody.innerHTML = '';

  if (activeList && lists[activeList]) {
    currentTableType = lists[activeList].type;
    const students = lists[activeList].students;


    if (currentTableType === 'attendance') {
      updateTableHeaderAttendance();
      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.surname}</td>
          <td>${student.name}</td>
          <td><input type="checkbox" ${student.attendance ? 'checked' : ''}></td>
          <td><input type="date" value="${student.date || ''}"></td>
        `;
        tbody.appendChild(row);
      });
    } else if (currentTableType === 'fundraising') {
      updateTableHeaderFundraising();
      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.surname}</td>
          <td>${student.name}</td>
          <td><input type="number" value="${student.amount || 0}"></td>
          <td><input type="date" value="${student.date || ''}"></td>
        `;
        tbody.appendChild(row);
      });
    }

    document.getElementById('student-table').style.display = 'table';
  }
}

function updateTableHeaderAttendance() {
  const headers = document.querySelectorAll('#student-table th');
  headers[2].textContent = 'Frekwencja';
  headers[3].textContent = 'Data';
}

function updateTableHeaderFundraising() {
  const headers = document.querySelectorAll('#student-table th');
  headers[2].textContent = 'Kwota';
  headers[3].textContent = 'Data';
}

function addStudent() {
  const name = document.getElementById('name').value.trim();
  const surname = document.getElementById('surname').value.trim();

  if (!activeList) {
    alert('Wybierz listę, do której chcesz dodać ucznia!');
    return;
  }

  if (!name || !surname) {
    alert('Wpisz imię i nazwisko!');
    return;
  }

  const student = { surname, name, date: '', attendance: false, amount: 0 };
  lists[activeList].students.push(student);
  localStorage.setItem('lists', JSON.stringify(lists));
  loadList();
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(lists, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lists.json';
  a.click();
}

function importJSON() {
  const fileInput = document.getElementById('import-file');
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedLists = JSON.parse(e.target.result);

      if (importedLists && typeof importedLists === "object") {

        for (const listName in importedLists) {
          if (!lists[listName]) {
            lists[listName] = importedLists[listName];
          } else {

            lists[listName].students = [
              ...lists[listName].students,
              ...importedLists[listName].students
            ];
          }
        }

        localStorage.setItem('lists', JSON.stringify(lists));
        alert('Dane zostały pomyślnie zaimportowane!');
        updateListSelector();
        loadList(); //
      } else {
        alert('Niepoprawna struktura danych w pliku!');
      }
    } catch (error) {
      alert('Błąd importu JSON! Sprawdź strukturę pliku.');
    }
  };
  reader.readAsText(file);
}

function deleteTable() {
  if (!activeList) {
    alert('Wybierz listę do usunięcia!');
    return;
  }

  if (confirm(`Czy na pewno chcesz usunąć listę "${activeList}"?`)) {
    delete lists[activeList];
    localStorage.setItem('lists', JSON.stringify(lists));
    updateListSelector();
    loadList();
    alert('Lista została usunięta!');
  }
}

function clearTable() {
  if (!activeList) {
    alert('Wybierz listę, którą chcesz wyczyścić!');
    return;
  }

  const tbody = document.getElementById('student-table').querySelector('tbody');
  tbody.innerHTML = '';
}

function clearLocalStorage() {
  if (confirm("Czy na pewno chcesz wyczyścić wszystkie dane?")) {
    localStorage.removeItem('lists');
    lists = {};
    updateListSelector();
    alert('Wszystkie dane zostały wyczyszczone!');
  }
}

function printPage() {

  const table = document.getElementById('student-table');
  const rows = table.querySelectorAll('tr');

  let printContent = '<table><thead><tr>';


  const headers = table.querySelectorAll('th');
  headers.forEach(header => {
    printContent += `<th>${header.textContent}</th>`;
  });
  printContent += '</tr></thead><tbody>';


  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      printContent += '<tr>';
      cells.forEach(cell => {

        if (cell.querySelector('input[type="checkbox"]')) {
          const checkbox = cell.querySelector('input[type="checkbox"]');
          printContent += `<td>${checkbox.checked ? '✔' : ''}</td>`;
        }

        else if (cell.querySelector('input[type="date"]')) {
          const dateInput = cell.querySelector('input[type="date"]');
          printContent += `<td>${dateInput.value || ''}</td>`;
        }

        else if (cell.querySelector('input[type="number"]')) {
          const numberInput = cell.querySelector('input[type="number"]');
          printContent += `<td>${numberInput.value || ''}</td>`;
        }

        else {
          printContent += `<td>${cell.textContent}</td>`;
        }
      });
      printContent += '</tr>';
    }
  });
  printContent += '</tbody></table>';


  const newWindow = window.open('', '', 'width=800, height=600');
  newWindow.document.write(`
    <html>
      <head><title>Drukowanie tabeli</title></head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
}

window.onload = updateListSelector;
