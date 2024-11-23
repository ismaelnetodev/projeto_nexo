// Pegando os elementos do HTML
const questionArea = document.getElementById("question-area");
const submitAnswerBtn = document.getElementById("submit-answer-btn");
const nextQuestionBtn = document.getElementById("next-question-btn");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");

// variaveis
let score = 0;
const usedQuestions = new Set();
const yearRange = { start: 2009, end: 2023 };
const indexRange = { start: 1, end: 180 };

// Gerar número aleatório
function getRandomNumber(start, end) {
    return Math.floor(Math.random() * (end - start + 1)) + start;
}

// Pegar questão aleatória única (não repetida)
function getUniqueRandomQuestion() {
    let year, index;

    do {
        year = getRandomNumber(yearRange.start, yearRange.end);
        index = getRandomNumber(indexRange.start, indexRange.end);
    } while (usedQuestions.has(`${year}-${index}`));

    usedQuestions.add(`${year}-${index}`);
    return { year, index };
}

// Pegar questão da API e verificar se veio certinho
async function fetchQuestion(year, index) {
    try {
        const res = await fetch(`https://api.enem.dev/v1/exams/${year}/questions/${index}`);
        if (!res.ok) {
            throw new Error(`Erro ao buscar questão: ${res.status}`);
        }
        const questionData = await res.json();
        return questionData;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Renderizar a questão no HTML
function renderQuestion(data) {
    if (!data || !data.alternatives) {
        questionArea.innerHTML = `<p>Erro ao carregar questão. Tente novamente.</p>`;
        return;
    }

    // Processar o contexto para Markdown (![]()) e outros textos
    let contextHtml = "";
    if (data.context) {
        contextHtml = data.context.replace(/!\[[^\]]*\]\((https?:\/\/[^\s]+)(?:\s+"[^"]*")?\)/g, (match, url) => {
            // Verificar se a imagem do contexto já está em `files` para evitar duplicação
            if (data.files && data.files.includes(url)) {
                return ""; // Ignorar a renderização dessa imagem
            }
            return `<img src="${url}" alt="Imagem do contexto" style="max-width: 100%; margin: 10px 0;">`;
        });

        // Quebrar linhas duplas em parágrafos
        contextHtml = contextHtml.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");
        contextHtml = `<p>${contextHtml}</p>`;
    }

    // Renderizar as imagens do enunciado, se existirem
    const imagesHtml = data.files && data.files.length > 0
        ? data.files.map(file => `<img src="${file}" alt="Imagem da questão" style="max-width: 100%; margin: 10px 0;">`).join("")
        : "";

    // Renderizar as alternativas
    const alternativesHtml = data.alternatives.map((alt) => {
        const alternativeId = `alternative-${alt.letter}`; // ID único para cada alternativa
        const alternativeContent = alt.text
            ? alt.text
            : alt.file
                ? `<img src="${alt.file}" alt="Imagem da alternativa ${alt.letter}">`
                : "Sem texto ou imagem";
    
        return `
            <input type="radio" id="${alternativeId}" name="answer" value="${alt.letter}" style="display: none;">
            <label for="${alternativeId}" class="custom-radio">
                ${alt.letter}: ${alternativeContent}
            </label>
        `;
    }).join("");

    questionArea.innerHTML = `
        <div class="question">
            <h2>${data.title}</h2>
            ${contextHtml}
            ${imagesHtml}
            <p>${data.alternativesIntroduction}</p>
        </div>
        <div class="answer-options">
            ${alternativesHtml}
        </div>
    `;

    // Armazenar a alternativa correta em um atributo de dados
    questionArea.dataset.correctAnswer = data.correctAlternative;
}

let questionAnswered = false; 

// Validar se a resposta está correta
function checkAnswer() {

    if (questionAnswered) {
        console.log("questao respondida");
        return;
    }

    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
        feedback.textContent = "Selecione uma resposta antes de enviar.";
        feedback.style.color = "red";
        return;
    }

    const correctAnswer = questionArea.dataset.correctAnswer;

    const allAlternatives = document.querySelectorAll('input[name="answer"]');
    allAlternatives.forEach(input => {
        input.disabled = true;
    });

    submitAnswerBtn.disabled = true; // Desativa o botão de envio
    questionAnswered = true; // Marca a questão como respondida

    if (selected.value === correctAnswer) {
        score += 84;
        updateScore();
    }
}

function updateScore(){
    console.log(score);
}

function checkAnswerAndLoadNext(){
    checkAnswer();
    if (questionAnswered) {
        setTimeout(loadQuestion, 1000);
    }
}

// Carregar uma nova questão
async function loadQuestion() {
    feedback.textContent = ""; // Limpa o feedback anterior

    submitAnswerBtn.disabled = false;
    questionAnswered = false;

    const { year, index } = getUniqueRandomQuestion();
    const questionData = await fetchQuestion(year, index);
    renderQuestion(questionData);
}

// Eventos dos botões
submitAnswerBtn.addEventListener('click', checkAnswerAndLoadNext);
nextQuestionBtn.addEventListener('click', loadQuestion);

// Carrega a primeira questão
loadQuestion();
