const ERROR_DISPLAY_VALUE = "E";
const LOCALE = Intl.NumberFormat().resolvedOptions().locale; // beware that the webapp may break if your country uses an unusual numbering system (a system that doesn't use commas or dots to separate thousands and decimals), as there is no test case for such scenarios.
const DECIMAL_SEPARATOR = Intl.NumberFormat(LOCALE)
  .formatToParts(0.5)
  .find(part => part.type === 'decimal')
  .value;
const THOUSAND_SEPARATOR = Intl.NumberFormat(LOCALE)
  .formatToParts(1000)
  .find(part => part.type === 'group')
  .value;

document.querySelector("#decimal-separator").textContent = DECIMAL_SEPARATOR;

let grid = document.querySelector(".grid");
let operation = document.querySelector(".operation");
let input = document.querySelector("#input");
let clear = document.querySelector("#clear");

let operators = document.querySelectorAll(".operator");
let numbers = document.querySelectorAll(".number");

document.addEventListener("keydown", handleKeyboardInput);
grid.addEventListener("mouseup", handleMouseInput);

let previousValue = 0;
let currentValue = 0;
let currentOperation = "";

function handleKeyboardInput(event) {
  const specialKeys = ["Enter", "Backspace", "Delete"];

  if (!specialKeys.includes(event.key) && event.key.length > 1 || event.code === "Space") return;

  let newInput = event.key;

  newInput = newInput === "/" ? "÷" :
    newInput === "*" ? "×" : newInput;

  const converted = convertFormattedToString(input.value);
  const decimalCount = input.value.slice(input.value.indexOf(DECIMAL_SEPARATOR) + 1).length + 1;

  if (newInput === DECIMAL_SEPARATOR) {
    input.value = !input.value.includes(DECIMAL_SEPARATOR) ? `${input.value}${DECIMAL_SEPARATOR}` : input.value;
    return;
  }

  if (newInput === "Delete" || input.value === ERROR_DISPLAY_VALUE) {
    input.value = 0;
    operation.textContent = "";
    clearAll();
    return;
  }

  if (newInput === "Backspace") {
    input.value = input.value.length > 1 ?
      (input.value.includes(DECIMAL_SEPARATOR)) ? input.value.slice(0, -1) :
        Intl.NumberFormat(LOCALE, { maximumFractionDigits: decimalCount }).format(String(currentValue).slice(0, -1)) : 0;
    currentValue = convertFormattedToNumber(input.value);
    return;
  }

  if (newInput === "Enter" || newInput === "=") {
    const result = calculate(previousValue, currentOperation, currentValue);
    const resultDecimals = String(result).slice(input.value.indexOf(DECIMAL_SEPARATOR) + 1).length + 1;

    const emptyCurrentOperation = Boolean(!currentOperation);

    input.value = result !== ERROR_DISPLAY_VALUE ? Intl.NumberFormat(LOCALE, { maximumFractionDigits: resultDecimals }).format(result) : ERROR_DISPLAY_VALUE;
    operation.textContent = "";

    if (!emptyCurrentOperation) clearAll();
    return;
  }

  if (isNaN(newInput)) {
    const alreadyHadOperation = Boolean(currentOperation);
    previousValue = alreadyHadOperation ? calculate(previousValue, currentOperation, currentValue) :
      convertFormattedToNumber(input.value);

    switch (newInput) {
      case "÷":
        currentOperation = "division";
        break;
      case "×":
        currentOperation = "multiplication";
        break;
      case "-":
        currentOperation = "subtraction";
        break;
      case "+":
        currentOperation = "addition";
        break;
      default:
        return;
    }

    operation.textContent = newInput;

    input.value = 0;
    return;
  }

  input.value = (input.value === "0" && !input.value.includes(DECIMAL_SEPARATOR)) || input.value == ERROR_DISPLAY_VALUE ?
    newInput :
    input.value.at(decimalCount) ? `${input.value}${newInput}` :
      Intl.NumberFormat(LOCALE, { maximumFractionDigits: decimalCount }).format(`${converted}${newInput}`);

  currentValue = convertFormattedToNumber(input.value);
}

function handleMouseInput(event) {
  if (event.target.tagName !== "BUTTON" && event.type === "mouseup") return;

  let newInput = event.target.textContent;
  const converted = convertFormattedToString(input.value);
  const decimalCount = input.value.slice(input.value.indexOf(DECIMAL_SEPARATOR) + 1).length + 1;

  if (newInput === DECIMAL_SEPARATOR) {
    input.value = !input.value.includes(DECIMAL_SEPARATOR) ? `${input.value}${DECIMAL_SEPARATOR}` : input.value;
    return;
  }

  if (event.target.id === "clear" || input.value === ERROR_DISPLAY_VALUE) {
    input.value = 0;
    operation.textContent = "";
    clearAll();
    return;
  }

  if (event.target.id === "backspace") {
    input.value = input.value.length > 1 ?
      (input.value.includes(DECIMAL_SEPARATOR)) ? input.value.slice(0, -1) :
        Intl.NumberFormat(LOCALE, { maximumFractionDigits: decimalCount }).format(String(currentValue).slice(0, -1)) : 0;
    currentValue = convertFormattedToNumber(input.value);
    return;
  }

  if (event.target.id === "equals") {
    const result = calculate(previousValue, currentOperation, currentValue);
    const resultDecimals = String(result).slice(input.value.indexOf(DECIMAL_SEPARATOR) + 1).length + 1;

    const emptyCurrentOperation = Boolean(!currentOperation);

    input.value = result !== ERROR_DISPLAY_VALUE ? Intl.NumberFormat(LOCALE, { maximumFractionDigits: resultDecimals }).format(result) : ERROR_DISPLAY_VALUE;
    operation.textContent = "";

    if (!emptyCurrentOperation) clearAll();
    return;
  }

  if (event.target.id === "square-root") {
    currentOperation = event.target.id;
    currentValue = convertFormattedToNumber(input.value);

    const result = calculate(currentValue, currentOperation);
    const resultDecimals = String(result).slice(input.value.indexOf(DECIMAL_SEPARATOR) + 1).length + 1;

    input.value = Intl.NumberFormat(LOCALE, { maximumFractionDigits: resultDecimals }).format(result);

    clearAll();
    return;
  }

  if (isNaN(newInput)) {
    const alreadyHadOperation = Boolean(currentOperation);
    previousValue = alreadyHadOperation ? calculate(previousValue, currentOperation, currentValue) :
      convertFormattedToNumber(input.value);

    currentOperation = event.target.id;
    operation.textContent = newInput;

    input.value = 0;
    return;
  }

  input.value = (input.value === "0" && !input.value.includes(DECIMAL_SEPARATOR)) || input.value == ERROR_DISPLAY_VALUE ?
    newInput :
    input.value.at(decimalCount) ? `${input.value}${newInput}` :
      Intl.NumberFormat(LOCALE, { maximumFractionDigits: decimalCount }).format(`${converted}${newInput}`);

  currentValue = convertFormattedToNumber(input.value);
};

function calculate(val1, operation, val2 = undefined) {
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
    default:
      return val1 !== 0 ? val1 : val2;
  }
}

function clearAll() {
  previousValue = 0;
  currentValue = 0;
  currentOperation = "";
}

function convertFormattedToNumber(formattedString) {
  return Number(formattedString.replaceAll(THOUSAND_SEPARATOR, "").replaceAll(DECIMAL_SEPARATOR, "."));
}

function convertFormattedToString(formattedString) {
  return formattedString.replaceAll(THOUSAND_SEPARATOR, "").replaceAll(DECIMAL_SEPARATOR, ".");
}