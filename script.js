document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('textarea');
    const lineNumbersEle = document.getElementById('line-numbers');

    const textareaStyles = window.getComputedStyle(textarea);
    [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'lineHeight',
        'padding',
    ].forEach((property) => {
        lineNumbersEle.style[property] = textareaStyles[property];
    });

    const parseValue = (v) => v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0;

    const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`;
    const paddingLeft = parseValue(textareaStyles.paddingLeft);
    const paddingRight = parseValue(textareaStyles.paddingRight);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;

    const calculateNumLines = (str) => {
        const textareaWidth = textarea.getBoundingClientRect().width - paddingLeft - paddingRight;
        const words = str.split(' ');
        let lineCount = 0;
        let currentLine = '';
        for (let i = 0; i < words.length; i++) {
            const wordWidth = context.measureText(words[i] + ' ').width;
            const lineWidth = context.measureText(currentLine).width;

            if (lineWidth + wordWidth > textareaWidth) {
                lineCount++;
                currentLine = words[i] + ' ';
            } else {
                currentLine += words[i] + ' ';
            }
        }

        if (currentLine.trim() !== '') {
            lineCount++;
        }

        return lineCount;
    };

    const calculateLineNumbers = () => {
        const lines = textarea.value.split('\n');
        const numLines = lines.map((line) => calculateNumLines(line));

        let lineNumbers = [];
        let i = 1;
        while (numLines.length > 0) {
            const numLinesOfSentence = numLines.shift();
            lineNumbers.push(i);
            if (numLinesOfSentence > 1) {
                Array(numLinesOfSentence - 1)
                    .fill('')
                    .forEach((_) => lineNumbers.push(''));
            }
            i++;
        }

        return lineNumbers;
    };

    const displayLineNumbers = () => {
        const lineNumbers = calculateLineNumbers();
        lineNumbersEle.innerHTML = Array.from({
            length: lineNumbers.length
        }, (_, i) => `<div>${lineNumbers[i] || '&nbsp;'}</div>`).join('');
    };

    textarea.addEventListener('input', () => {
        displayLineNumbers();
    });

    displayLineNumbers();

    const ro = new ResizeObserver(() => {
        const rect = textarea.getBoundingClientRect();
        lineNumbersEle.style.height = `${rect.height}px`;
        displayLineNumbers();
    });
    ro.observe(textarea);

    textarea.addEventListener('scroll', () => {
        lineNumbersEle.scrollTop = textarea.scrollTop;
    });
});

const root = document.querySelector(':root');
const runButton = document.getElementById('run');
runButton.onclick = run_it;

function run_it(){

    runButton.onclick = false;
    root.style.setProperty('--playWhite', '#ffffff60');
    root.style.setProperty('--pulsColor', 'rgba(255, 255, 255, 0.0)');
    logger.innerHTML = '';
    var src = document.getElementById('textarea').value;

    console.log("Transcribing your Code.. Please wait");
  fetch("https://peranaichill-backend.vercel.app/api", {
    headers: {
    'Accept': 'text/plain',
    'Content-Type': 'text/plain',
    'Connection': 'keep-alive'

    },
    method: "POST",
    body: src
  })
  .then(function(res){
    res.text().then(function(val){
        if (val.length == 0)
        {
          console.error("Transcription Error.");
          runButton.onclick = run_it;
          root.style.setProperty('--playWhite', '#ffffff');
          root.style.setProperty('--pulsColor', 'rgba(255, 255, 255, 0.75)');
          return;
        }
        logger.innerHTML = '';
        try {
            var F = new Function(val);
            F();
            runButton.onclick = run_it;
          root.style.setProperty('--playWhite', '#ffffff');
          root.style.setProperty('--pulsColor', 'rgba(255, 255, 255, 0.75)');
        } catch (ex) {
            console.error("Execution Error.");
            runButton.onclick = run_it;
          root.style.setProperty('--playWhite', '#ffffff');
          root.style.setProperty('--pulsColor', 'rgba(255, 255, 255, 0.75)');
        }
        
        }).catch((err)=>{console.error("API Error."); runButton.onclick = run_it;
        root.style.setProperty('--playWhite', '#ffffff');});
        root.style.setProperty('--pulsColor', 'rgba(255, 255, 255, 0.75)');
    }).catch( (err)=>
{
    console.error('Connection Error.');
    runButton.onclick = run_it;
    root.style.setProperty('--playWhite', '#ffffff');
    root.style.setProperty('--pulsColor', 'rgba(255, 255, 255, 0.75)');
})
}   

const logger = document.getElementById('log');


console.log = function (message) {
    const p = logger.appendChild(document.createElement('p'));
    message = message.replaceAll(/(\r\n|\r|\n)/g, '<br/>');
    p.innerHTML = message;
    p.className = 'console-output';
};

console.error = function (message) {
    const p = logger.appendChild(document.createElement('p'));
    message = message.replaceAll(/(\r\n|\r|\n)/g, '<br/>');
    p.innerHTML = message;
    p.style.color = 'red';
    p.className = 'console-output';
};

