let grid = document.querySelector(".grid");
let operation = document.querySelector(".operation");
let input = document.querySelector("#input");
let clear = document.querySelector("#clear");

document.addEventListener("keydown", handleKeyboardInput);
grid.addEventListener("mouseup", handleMouseInput);

const ERROR_DISPLAY_VALUE = "E";

let previousValue = 0;
let currentValue = 0;
let currentOperation = "";

function handleKeyboardInput(event) {
  const specialKeys = ["Enter", "Backspace", "Delete"];

  if (!specialKeys.includes(event.key) && event.key.length > 1) return;

  let newInput = event.key;

  newInput = newInput === "/" ? "÷" :
    newInput === "*" ? "×" : newInput;

  if (newInput === ".") {
    input.value = `${input.value}.`;
    return;
  }

  if (newInput === "Delete" || input.value === ERROR_DISPLAY_VALUE) {
    input.value = 0;
    clearAll();
    return;
  }

  if (newInput === "Backspace") {
    input.value = input.value.length > 1 ? input.value.slice(0, -1) : input.value;
    return;
  }

  if (newInput === "Enter" || newInput === "=") {
    input.value = operate(previousValue, currentOperation, currentValue);
    operation.textContent = "";

    clearAll();
    return;
  }

  if (isNaN(newInput)) {
    previousValue = Number(input.value);

    switch (event.key) {
      case "/":
        currentOperation = "division";
        break;
      case "*":
        currentOperation = "multiplication";
        break;
      case "-":
        currentOperation = "subtraction";
        break;
      case "+":
        currentOperation = "addition";
        break;
    }

    operation.textContent = newInput;

    input.value = 0;
    return;
  }

  input.value = input.value == 0 || input.value == ERROR_DISPLAY_VALUE ? newInput : `${input.value}${newInput}`;
  currentValue = Number(input.value);
}

function handleMouseInput(event) {
  if (event.target.tagName !== "BUTTON" && event.type === "mouseup") return;

  let newInput = event.target.textContent;

  if (newInput === ".") {
    input.value = `${input.value}.`;
    return;
  }

  if (event.target.id === "clear" || input.value === ERROR_DISPLAY_VALUE) {
    input.value = 0;
    clearAll();
    return;
  }

  if (event.target.id === "backspace") {
    input.value = input.value.length > 1 ? input.value.slice(0, -1) : input.value;
    return;
  }

  if (event.target.id === "equals") {
    input.value = operate(previousValue, currentOperation, currentValue);
    operation.textContent = "";

    clearAll();
    return;
  }

  if (event.target.id === "square-root") {
    currentOperation = event.target.id;
    currentValue = input.value;
    input.value = operate(currentValue, currentOperation);

    clearAll();
    return;
  }

  if (isNaN(newInput)) {
    previousValue = Number(input.value);

    currentOperation = event.target.id;
    operation.textContent = newInput;

    input.value = 0;
    return;
  }

  input.value = input.value == 0 || input.value == ERROR_DISPLAY_VALUE ? newInput : `${input.value}${newInput}`;
  currentValue = Number(input.value);
};

function operate(val1, operation, val2 = undefined) {
  if (isNaN(val1) || (val2 !== undefined && isNaN(val2))) return ERROR_DISPLAY_VALUE;

  switch (operation) {
    case "addition":
      return val1 + val2;
    case "subtraction":
      return val1 - val2;
    case "multiplication":
      return val1 * val2;
    case "division":
      if (val2 === 0) return ERROR_DISPLAY_VALUE;
      return val1 / val2;
    case "exponentiation":
      return val1 ** val2;
    case "square-root":
      return Math.sqrt(val1);
  }
}

function clearAll() {
  previousValue = 0;
  currentValue = 0;
  currentOperation = "";
}