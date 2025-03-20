"use strict";

const inputBox = document.querySelector("#input-box");
const theList = document.querySelector("#unordered-list");
const searchBox = document.querySelector("#search-box");
const deleteDialog = document.querySelector("#delete-dialog");
const taskContent = document.querySelector("#task-content");
const confirmDelete = document.querySelector("#confirm-delete");
const cancelDelete = document.querySelector("#cancel-delete");
const undoButton = document.querySelector("#undo-button");
const listSelect = document.querySelector("#list-select");
const caseInsensitiveCheckbox = document.querySelector(
  "#case-insensitive-checkbox"
);

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
const currentDate = `${day}.${month}.${year}`;

let taskToDelete;
let deletedTasks = [];

const createListItem = (text) => {
  const listItem = document.createElement("li");
  listItem.innerText = text;
  const deleteTask = document.createElement("span");
  deleteTask.innerText = "x";
  listItem.append(deleteTask);
  return listItem;
};

const addTask = () => {
  if (inputBox.value !== "") {
    const listItem = createListItem(inputBox.value);
    const selectedList = document.querySelector(`#${listSelect.value}-list`);
    selectedList.append(listItem);
    save();
  }
  inputBox.value = "";
};

const restoreTask = () => {
  if (deletedTasks.length > 0) {
    const lastDeletedTask = deletedTasks.pop();
    const listItem = createListItem(lastDeletedTask.content.trim());
    const selectedList = document.querySelector(
      `#${lastDeletedTask.list}-list`
    );
    selectedList.append(listItem);
    deletedTasks = [];
    save();
  }
};

const filterTasks = () => {
  const filter = searchBox.value.trim();
  const caseInsensitive = caseInsensitiveCheckbox.checked;
  const tasks = document.querySelectorAll(".task-ul li");

  if (filter === "") {
    tasks.forEach((task) => {
      task.style.display = "";
    });
    return;
  }

  tasks.forEach((task) => {
    const taskText = task.innerText.trim();
    const taskToCompare = caseInsensitive ? taskText.toLowerCase() : taskText;
    const filterToCompare = caseInsensitive ? filter.toLowerCase() : filter;

    if (taskToCompare.includes(filterToCompare)) task.style.display = "";
    else task.style.display = "none";
  });
};

const moveToTrash = (task, listId) => {
  const dateElement = task.querySelector(".date-completed");
  const deletedTask = {
    content: dateElement
      ? task.innerText.slice(0, -dateElement.innerText.length - 2)
      : task.innerText.slice(0, -1),
    list: listId,
  };
  deletedTasks.push(deletedTask);
  task.remove();
  save();
};

const toggleList = (listId) => {
  const list = document.getElementById(listId);
  if (list.style.display === "none") {
    list.style.display = "block";
  } else {
    list.style.display = "none";
  }
};

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName === "LI") {
    target.classList.toggle("checked");
    if (target.classList.contains("checked")) {
      const dateElement = document.createElement("div");
      dateElement.className = "date-completed";
      dateElement.innerText = `${currentDate}`;
      target.appendChild(dateElement);
    } else {
      const dateElement = target.querySelector(".date-completed");
      if (dateElement) {
        dateElement.remove();
      }
    }
    save();
  } else if (target.tagName === "SPAN") {
    taskToDelete = target.parentElement;
    const dateElement = taskToDelete.querySelector(".date-completed");
    if (dateElement) {
      taskContent.innerText = taskToDelete.innerText.slice(
        0,
        -dateElement.innerText.length - 2
      );
    } else {
      taskContent.innerText = taskToDelete.innerText.slice(0, -1);
    }
    deleteDialog.showModal();
  }
});

confirmDelete.addEventListener("click", () => {
  if (taskToDelete) {
    const listId = taskToDelete.parentElement.id.replace("-list", "");
    moveToTrash(taskToDelete, listId);
    deleteDialog.close();
  }
});

cancelDelete.addEventListener("click", () => {
  deleteDialog.close();
});

undoButton.addEventListener("click", () => {
  restoreTask();
});

searchBox.addEventListener("input", filterTasks);
caseInsensitiveCheckbox.addEventListener("change", filterTasks);

const save = () => {
  const lists = document.querySelectorAll(".task-ul");
  lists.forEach((list) => {
    localStorage.setItem(list.id, list.innerHTML);
  });
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
};

const showTasks = () => {
  const lists = document.querySelectorAll(".task-ul");
  lists.forEach((list) => {
    const storedTasks = localStorage.getItem(list.id);
    if (storedTasks) {
      list.innerHTML = storedTasks;
    }
  });
};

showTasks();
