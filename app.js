document.addEventListener('DOMContentLoaded', () => {
    // DOM ELEMENTS
    const loginPage = document.getElementById('login-page');
    const examPage = document.getElementById('exam-page');
    const resultsPage = document.getElementById('results-page');
    const loginForm = document.getElementById('login-form');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCounter = document.getElementById('question-counter');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-part-btn');
    const finalScore = document.getElementById('final-score');
    const logoutBtn = document.getElementById('logout-btn');
    const timerDisplay = document.getElementById('timer');
    const cameraFeed = document.getElementById('camera-feed');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const startCameraBtn = document.getElementById('start-camera-btn');
    const instructionsBox = document.getElementById('instructions');

    // VARIABLES
    let questions = [];
    let currentPartIndex = 0;
    let currentQuestionIndex = 0;
    let selectedAnswers = {};
    let timerInterval;
    const PART_DURATION = 60 * 15; // 15 mins per part

    // ✅ LOGIN
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginPage.classList.add('hidden');
        examPage.classList.remove('hidden');

        if (typeof questionsData !== 'undefined') {
            questions = questionsData.parts;
            showInstructions();
            startPart(currentPartIndex);
        } else {
            alert("❌ Questions not loaded.");
        }
    });

    // ✅ CAMERA
    startCameraBtn?.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraFeed.srcObject = stream;
            cameraFeed.play();
            cameraFeed.classList.remove('hidden');
            cameraPlaceholder.classList.add('hidden');
        } catch (err) {
            console.error("Camera error:", err);
            cameraPlaceholder.innerHTML = "<p>Camera not available or permission denied.</p>";
        }
    });

    // ✅ START PART
    function startPart(index) {
    currentPartIndex = index;
    currentQuestionIndex = 0;

    // 👇 Add this line to update the heading
    document.getElementById('part-title').textContent = `Part ${index + 1}`;

    startTimer(PART_DURATION);
    showQuestion();
}


    // ✅ SHOW INSTRUCTIONS
    function showInstructions() {
        if (instructionsBox) {
            instructionsBox.innerHTML = `
                <h3>📘 Instructions:</h3>
                <ul>
                    <li>Each part is timed separately (15 minutes)</li>
                    <li>Select one option per question</li>
                    <li>Once submitted, you cannot return to a part</li>
                    <li>Camera must remain active</li>
                </ul>
            `;
        }
    }

    // ✅ SHOW QUESTION
    function showQuestion() {
        const part = questions[currentPartIndex];
        const q = part[currentQuestionIndex];

        questionText.textContent = `${currentQuestionIndex + 1}. ${q.question}`;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${part.length}`;
        optionsContainer.innerHTML = '';

        q.options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.className = 'option-btn';
            const key = `${currentPartIndex}-${currentQuestionIndex}`;
            if (selectedAnswers[key] === opt) btn.classList.add('selected');

            btn.onclick = () => {
                selectedAnswers[key] = opt;
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };

            optionsContainer.appendChild(btn);
        });

        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === part.length - 1;
    }

    // ✅ TIMER
    function startTimer(seconds) {
        let remaining = seconds;
        timerDisplay.textContent = formatTime(remaining);
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            remaining--;
            timerDisplay.textContent = formatTime(remaining);
            if (remaining <= 0) {
                clearInterval(timerInterval);
                alert("⏰ Time's up for this part!");
                submitCurrentPart();
            }
        }, 1000);
    }

    function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    // ✅ NAVIGATION
    nextBtn.addEventListener('click', () => {
        const part = questions[currentPartIndex];
        if (currentQuestionIndex < part.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    });

    // ✅ SUBMIT BUTTON
    submitBtn.addEventListener('click', () => {
        if (confirm("Submit this part? You won't be able to return.")) {
            submitCurrentPart();
        }
    });

    function submitCurrentPart() {
        clearInterval(timerInterval);
        if (currentPartIndex < questions.length - 1) {
            currentPartIndex++;
            startPart(currentPartIndex);
        } else {
            finishExam();
        }
    }

    // ✅ FINISH EXAM
    function finishExam() {
        examPage.classList.add('hidden');
        resultsPage.classList.remove('hidden');

        let score = 0;
        let total = 0;

        questions.forEach((part, partIndex) => {
            part.forEach((q, qIndex) => {
                const key = `${partIndex}-${qIndex}`;
                total++;
                if (selectedAnswers[key] === q.answer) score++;
            });
        });

        finalScore.textContent = `${score} / ${total}`;
    }

    // ✅ LOGOUT
    logoutBtn.addEventListener('click', () => {
        window.location.reload();
    });
});
