document.addEventListener('DOMContentLoaded', () => {
    // --- PAGE ELEMENTS ---
    const loginPage = document.getElementById('login-page');
    const examPage = document.getElementById('exam-page');
    const resultsPage = document.getElementById('results-page');

    const loginForm = document.getElementById('login-form');
    const partTitle = document.getElementById('part-title');
    const timerEl = document.getElementById('timer');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCounter = document.getElementById('question-counter');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitPartBtn = document.getElementById('submit-part-btn');

    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const videoFeed = document.getElementById('camera-feed');
    const logoutBtn = document.getElementById('logout-btn');

    // --- APP STATE VARIABLES ---
    let allQuestions = [];
    let currentPartIndex = 0;
    let currentQuestionIndex = 0;
    let userAnswers = {}; // Stores answers { 'part-question': 'answer' }
    let scores = [];
    let timerInterval;

    const PART_DURATION = 30 * 60; // 30 minutes per part

    // --- APP INITIALIZATION ---
    const init = async () => {
        loginForm.addEventListener('submit', handleLogin);
        nextBtn.addEventListener('click', showNextQuestion);
        submitPartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to submit this part? You cannot go back.')) {
                handleSubmitPart();
            }
        });
        logoutBtn.addEventListener('click', handleLogout);
        optionsContainer.addEventListener('change', handleAnswerSelection);

        try {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            allQuestions = data.parts;
        } catch (error) {
            console.error('Failed to load questions:', error);
            alert('Failed to load exam questions. Please refresh the page.');
        }
    };

    // --- LOGIN FUNCTION ---
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        if (username.trim()) {
            loginPage.classList.add('hidden');
            examPage.classList.remove('hidden');
            startCamera(); // Automatically start camera on login
            startPart(0);
        }
    }

    // --- LOGOUT FUNCTION ---
    function handleLogout() {
        resultsPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
        document.getElementById('login-form').reset();

        currentPartIndex = 0;
        currentQuestionIndex = 0;
        userAnswers = {};
        scores = [];
        stopCamera();
        clearInterval(timerInterval);
    }

    // --- CAMERA START FUNCTION ---
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoFeed.srcObject = stream;
            cameraPlaceholder.classList.add('hidden');
            videoFeed.classList.remove('hidden');
        } catch (err) {
            console.error("Error accessing camera: ", err);
            cameraPlaceholder.innerHTML = `<p>Camera access was denied.</p>`;
        }
    }

    // --- CAMERA STOP FUNCTION ---
    function stopCamera() {
        if (videoFeed.srcObject) {
            videoFeed.srcObject.getTracks().forEach(track => track.stop());
        }
        videoFeed.srcObject = null;
        videoFeed.classList.add('hidden');
        cameraPlaceholder.classList.remove('hidden');
        cameraPlaceholder.innerHTML = `<p>Camera is off</p>`;
    }

    // --- START PART FUNCTION ---
    function startPart(partIndex) {
        currentPartIndex = partIndex;
        currentQuestionIndex = 0;
        partTitle.textContent = `Part ${partIndex + 1}`;
        displayQuestion(currentQuestionIndex);
        startTimer();
    }

    // --- DISPLAY A QUESTION ---
    function displayQuestion(qIndex) {
        const partQuestions = allQuestions[currentPartIndex];
        const question = partQuestions[qIndex];

        questionText.textContent = `${qIndex + 1}. ${question.question}`;
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionId = `q${qIndex}_option${index}`;
            const li = document.createElement('label');
            li.className = 'option';
            li.htmlFor = optionId;

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question-${qIndex}`;
            radio.value = option;
            radio.id = optionId;

            const answerKey = `${currentPartIndex}-${qIndex}`;
            if (userAnswers[answerKey] === option) {
                radio.checked = true;
                li.classList.add('selected');
            }

            li.appendChild(radio);
            li.appendChild(document.createTextNode(` ${option}`));
            optionsContainer.appendChild(li);
        });

        updateNavigation();
    }

    // --- HANDLE ANSWER SELECTION ---
    function handleAnswerSelection(e) {
        if (e.target.type === 'radio') {
            const selectedOption = e.target.value;
            const answerKey = `${currentPartIndex}-${currentQuestionIndex}`;
            userAnswers[answerKey] = selectedOption;

            document.querySelectorAll('.option').forEach(label => label.classList.remove('selected'));
            e.target.parentElement.classList.add('selected');
        }
    }

    // --- SHOW NEXT QUESTION ---
    function showNextQuestion() {
        if (currentQuestionIndex < allQuestions[currentPartIndex].length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    }

    // --- SUBMIT PART FUNCTION ---
    function handleSubmitPart() {
        clearInterval(timerInterval);
        calculateScore();

        if (currentPartIndex < allQuestions.length - 1) {
            startPart(currentPartIndex + 1);
        } else {
            showFinalResults();
        }
    }

    // --- CALCULATE SCORE FOR CURRENT PART ---
    function calculateScore() {
        let score = 0;
        const partQuestions = allQuestions[currentPartIndex];
        partQuestions.forEach((q, index) => {
            const answerKey = `${currentPartIndex}-${index}`;
            if (userAnswers[answerKey] === q.answer) {
                score++;
            }
        });
        scores[currentPartIndex] = score;
    }

    // --- DISPLAY FINAL RESULTS ---
    function showFinalResults() {
        examPage.classList.add('hidden');
        resultsPage.classList.remove('hidden');

        const totalScore = scores.reduce((acc, current) => acc + (current || 0), 0);
        const totalQuestions = allQuestions.reduce((acc, part) => acc + part.length, 0);
        document.getElementById('final-score').textContent = `${totalScore} / ${totalQuestions}`;
    }

    // --- UPDATE NAVIGATION BUTTONS ---
    function updateNavigation() {
        const partQuestions = allQuestions[currentPartIndex];
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} / ${partQuestions.length}`;
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === partQuestions.length - 1;
    }

    // --- START TIMER FUNCTION ---
    function startTimer() {
        let timeLeft = PART_DURATION;
        timerEl.textContent = formatTime(timeLeft);

        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("Time's up for this part!");
                handleSubmitPart();
            }
        }, 1000);
    }

    // --- FORMAT TIME AS MM:SS ---
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // --- INITIALIZE THE APP ---
    init();
});
