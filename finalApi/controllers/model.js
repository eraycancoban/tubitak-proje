const fetch = require('node-fetch');

async function analyzeTextWithAPI(text) {
    const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
}

const text = `
    I had the best day ever today. I woke up this morning, the sun was shining through the curtains and I could smell breakfast cooking downstairs...
`;

analyzeTextWithAPI(text)
    .then((result) => {
        console.log('Analysis result:', result);
    })
    .catch((err) => {
        console.error('Error:', err);
    });
