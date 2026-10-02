let currentDisplay = '0';
let expressionDisplay = '';
let memoryValue = 0;
let history = [];

// DOM Elements
const mainDisplay = document.getElementById('main-display');
const historyExpression = document.getElementById('history-expression');
const themeToggle = document.getElementById('theme-toggle');
const historyToggle = document.getElementById('history-toggle');
const historyDrawer = document.getElementById('history-drawer');
const historyList = document.getElementById('history-list');
const historyBackButton = document.getElementById('history-back-button');
const modeBtns = document.querySelectorAll('.mode-btn');
const sciKeys = document.querySelector('.sci-keys');

// Theme Switcher
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
        icon.classList.replace('fa-sun', 'fa-moon');
    } else {
        icon.classList.replace('fa-moon', 'fa-sun');
    }
});

// Mode Toggle (Basic vs Scientific)
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.mode === 'scientific') {
            sciKeys.classList.remove('hidden');
        } else {
            sciKeys.classList.add('hidden');
        }
    });
});

// History Drawer Toggle
historyToggle.addEventListener('click', () => {
    historyDrawer.classList.toggle('hidden');
});

historyBackButton.addEventListener('click', () => {
    historyDrawer.classList.add('hidden');
});

function updateDisplay() {
    mainDisplay.textContent = currentDisplay;
    historyExpression.textContent = expressionDisplay;
}

function appendValue(val) {
    if (currentDisplay === '0' && val !== '.') {
        currentDisplay = val;
    } else {
        currentDisplay += val;
    }
    updateDisplay();
}

function appendOperator(op) {
    const lastChar = currentDisplay.slice(-1);
    if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        currentDisplay = currentDisplay.slice(0, -1) + op;
    } else {
        currentDisplay += op;
    }
    updateDisplay();
}

function appendFunction(func) {
    if (currentDisplay === '0') {
        currentDisplay = func;
    } else {
        currentDisplay += func;
    }
    updateDisplay();
}

function clearAll() {
    currentDisplay = '0';
    expressionDisplay = '';
    updateDisplay();
}

function deleteLast() {
    if (currentDisplay.length === 1 || currentDisplay === 'Error') {
        currentDisplay = '0';
    } else {
        currentDisplay = currentDisplay.slice(0, -1);
    }
    updateDisplay();
}

function calculateResult() {
    try {
        let parsedExpression = currentDisplay
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/\^/g, '**');

        expressionDisplay = currentDisplay + ' =';
        const result = eval(parsedExpression);
        
        if (result === undefined || isNaN(result) || !isFinite(result)) {
            currentDisplay = 'Error';
        } else {
            const formattedResult = Number(result.toFixed(8)).toString();
            addToHistory(currentDisplay, formattedResult);
            currentDisplay = formattedResult;
        }
    } catch (err) {
        currentDisplay = 'Error';
    }
    updateDisplay();
}

// Memory Functions
function handleMemory(action) {
    const currentVal = parseFloat(currentDisplay) || 0;
    switch (action) {
        case 'MC':
            memoryValue = 0;
            break;
        case 'MR':
            currentDisplay = memoryValue.toString();
            updateDisplay();
            break;
        case 'M+':
            memoryValue += currentVal;
            break;
        case 'M-':
            memoryValue -= currentVal;
            break;
        case 'MS':
            memoryValue = currentVal;
            break;
    }
}

// History Functions
function addToHistory(expr, res) {
    history.unshift({ expr, res });
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    if (history.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'history-empty-state';
        emptyState.textContent = 'No history yet';
        historyList.appendChild(emptyState);
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `<div class="expr">${item.expr}</div><div class="res">${item.res}</div>`;
        li.addEventListener('click', () => {
            currentDisplay = item.res;
            updateDisplay();
            historyDrawer.classList.add('hidden');
        });
        historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    renderHistory();
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') appendValue(e.key);
    if (['+', '-', '*', '/'].includes(e.key)) appendOperator(e.key);
    if (e.key === 'Enter' || e.key === '=') calculateResult();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearAll();
});
