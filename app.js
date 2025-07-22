document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('login-page');
    const examPage = document.getElementById('exam-page');
    const loginForm = document.getElementById('login-form');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCounter = document.getElementById('question-counter');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-part-btn');
    const finalScore = document.getElementById('final-score');
    const resultsPage = document.getElementById('results-page');
    const logoutBtn = document.getElementById('logout-btn');

    let questions = [];
    let currentIndex = 0;
    let score = 0;
    let selectedAnswers = [];

    // ✅ LOGIN
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loginPage.classList.add('hidden');
        examPage.classList.remove('hidden');

        // Load questions
        if (typeof questionsData !== 'undefined') {
            questions = questionsData.parts.flat();
            showQuestion();
        } else {
            alert("Questions not loaded.");
        }
    });

    // ✅ SHOW QUESTION
    function showQuestion() {
        const q = questions[currentIndex];
        questionText.textContent = `${currentIndex + 1}. ${q.question}`;
        questionCounter.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
        optionsContainer.innerHTML = '';

        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.classList.add('option-btn');
            if (selectedAnswers[currentIndex] === opt) btn.classList.add('selected');

            btn.onclick = () => {
                selectedAnswers[currentIndex] = opt;
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
            optionsContainer.appendChild(btn);
        });

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === questions.length - 1;
    }

    // ✅ NAVIGATION
    nextBtn.addEventListener('click', () => {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            showQuestion();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            showQuestion();
        }
    });

    // SUBMIT
    submitBtn.addEventListener('click', () => {
        score = 0;
        questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.answer) score++;
        });

        examPage.classList.add('hidden');
        resultsPage.classList.remove('hidden');
        finalScore.textContent = `${score} / ${questions.length}`;
    });

    // LOGOUT
    logoutBtn.addEventListener('click', () => {
        window.location.reload();
    });
});
