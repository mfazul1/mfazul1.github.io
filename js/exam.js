document.addEventListener('DOMContentLoaded', function () {
    const showBtn = document.getElementById('show-btn');
    const submitBtn = document.getElementById('submit-btn');
    const subjectSelect = document.getElementById('subject-select');
    const classSelect = document.getElementById('class-select');
    const chapterSelect = document.getElementById('chapter-select');
    const difficultySelect = document.getElementById('difficulty-select');
    const numQuestionsSelect = document.getElementById('num-questions-select');
    const scoreDisplay = document.getElementById('score-display');
    const finalScoreText = document.getElementById('final-score-text');
    const questionBox = document.getElementById('question-box');
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    const timerProgressFill = document.getElementById('timer-progress-fill');

    // Feedback modal elements
    const feedbackModal = document.getElementById('feedbackModal');
    const starRatingContainer = document.getElementById('star-rating');
    const feedbackTextarea = document.getElementById('feedbackText');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const feedbackFormBody = feedbackModal.querySelector('.modal-body p');
    const feedbackFormGroups = feedbackModal.querySelectorAll('.form-group');
    const feedbackModalFooter = feedbackModal.querySelector('.modal-footer');
    const feedbackLoadingContainer = document.getElementById('feedbackLoadingContainer');
    let stars = [];

    // Explanation modal elements
    const explanationBody = document.getElementById('explanation-body');

    const FEEDBACK_SESSION_KEY = 'feedbackRequestedThisSession';

    let timerInterval = null;
    let timeRemaining = 0;
    let totalTime = 0;

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function showAlert(title, message) {
        $('#generalAlertModalLabel').text(title);
        $('#generalAlertModalBody').html(message);
        $('#generalAlertModal').modal('show');
    }

    let GROQ_API_KEY = '';
    let questionsData = [];
    let userAnswers = {};
    let chapterData = {};
    let selectedRating = 0;
    let isSubmitted = false;

    getSecret().then(key => {
        GROQ_API_KEY = key;
    });

    fetch('https://api.npoint.io/aa477d0ba2e0d392f45f')
        .then(response => response.json())
        .then(data => chapterData = data)
        .catch(error => console.error('Error fetching chapter data:', error));

    async function getSecret() {
        try {
            const response = await fetch('https://api.npoint.io/e7926abb4dad1dfcc984');
            const data = await response.json();
            return data.groq_api_key;
        } catch (error) {
            console.error('Failed to fetch API key:', error);
            questionBox.innerHTML = 'Failed to load API configuration. Please contact the administrator.';
            return null;
        }
    }

    showBtn.addEventListener('click', fetchQuestions);
    submitBtn.addEventListener('click', handleSubmit);

$(classSelect).niceSelect();
$(subjectSelect).niceSelect();
$(chapterSelect).niceSelect();

$(classSelect).on('change', updateChapterSelect);
$(subjectSelect).on('change', updateChapterSelect);

    $('#scoreModal').on('hidden.bs.modal', function () {
        scoreDisplay.innerHTML = '';
        finalScoreText.innerHTML = '';
        if (feedbackModal && !sessionStorage.getItem(FEEDBACK_SESSION_KEY)) {
            $('#feedbackModal').modal('show');
            sessionStorage.setItem(FEEDBACK_SESSION_KEY, 'true');
        }
    });

    $('#feedbackModal').on('shown.bs.modal', function () {
        if (starRatingContainer) {
            stars = starRatingContainer.querySelectorAll('.star');
            stars.forEach(star => {
                star.removeEventListener('mouseover', handleMouseOver);
                star.removeEventListener('mouseout', handleMouseOut);
                star.removeEventListener('click', handleClick);
                star.addEventListener('mouseover', handleMouseOver);
                star.addEventListener('mouseout', handleMouseOut);
                star.addEventListener('click', handleClick);
            });
            selectedRating = 0;
            highlightStars(0);
        }
    });

    function handleMouseOver(event) {
        highlightStars(event.target.dataset.value);
    }

    function handleMouseOut() {
        highlightStars(selectedRating);
    }

    function handleClick(event) {
        setRating(event.target.dataset.value);
    }

    function highlightStars(rating) {
        if (!stars.length) return;
        stars.forEach(star => {
            if (star.dataset.value <= rating) {
                star.classList.add('rated');
            } else {
                star.classList.remove('rated');
            }
        });
    }

    function setRating(rating) {
        selectedRating = parseInt(rating);
        highlightStars(selectedRating);
    }

    if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', function() {
            const feedbackText = feedbackTextarea.value;
            const rating = selectedRating;

            if (rating === 0) {
                showAlert('Feedback Required', 'Please provide a rating before submitting.');
                return;
            }

            const now = new Date();
            const sessionId = now.getTime();
            const date = now.toLocaleDateString('en-CA');
            const time = now.toLocaleTimeString('en-CA', { hour12: false });
            const website = "jeeiitianbooks.in";

            feedbackFormBody.style.display = 'none';
            feedbackFormGroups.forEach(group => group.style.display = 'none');
            feedbackModalFooter.style.display = 'none';
            if (feedbackLoadingContainer) {
                feedbackLoadingContainer.style.display = 'block';
            }

            $.ajax({
                url: 'https://archgpt.in/api/submit-feedback/',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    rating: rating,
                    comments: feedbackText,
                    sessionId: sessionId,
                    date: date,
                    time: time,
                    website: website
                }),
                success: function(response) {
                    if (response.success) {
                        showAlert('Feedback Submitted', 'Thank you for your feedback! It has been submitted successfully.');
                        sessionStorage.setItem(FEEDBACK_SESSION_KEY, 'true');
                    } else {
                        showAlert('Feedback Submission Failed', 'Failed to submit feedback: ' + (response.message || 'Unknown error.'));
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    let errorMessage = 'Error submitting feedback. Please try again later.';
                    if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                        errorMessage += ' Details: ' + jqXHR.responseJSON.message;
                    } else {
                        errorMessage += ' Details: ' + textStatus + ' - ' + errorThrown;
                    }
                    showAlert('Error', errorMessage);
                    console.error('AJAX error:', textStatus, errorThrown, jqXHR);
                },
                complete: function() {
                    if (feedbackLoadingContainer) {
                        feedbackLoadingContainer.style.display = 'none';
                    }
                    feedbackFormBody.style.display = 'block';
                    feedbackFormGroups.forEach(group => group.style.display = 'block');
                    feedbackModalFooter.style.display = 'flex';
                    $('#feedbackModal').modal('hide');
                    feedbackTextarea.value = '';
                    selectedRating = 0;
                    highlightStars(0);
                }
            });
        });
    }

    function startTimer(minutes) {
        stopTimer();
        totalTime = minutes * 60;
        timeRemaining = totalTime;
        timerBar.style.display = 'flex';
        updateTimerDisplay();
        timerInterval = setInterval(function () {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                stopTimer();
                if (!isSubmitted) {
                    showAlert('Time\'s Up!', 'Your time is over. The test will be submitted automatically.');
                    handleSubmit();
                }
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerText.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

        const pct = (timeRemaining / totalTime) * 100;
        timerProgressFill.style.width = pct + '%';

        timerText.classList.remove('warning', 'danger');
        timerProgressFill.classList.remove('warning', 'danger');

        if (timeRemaining <= 60) {
            timerText.classList.add('danger');
            timerProgressFill.classList.add('danger');
        } else if (timeRemaining <= 180) {
            timerText.classList.add('warning');
            timerProgressFill.classList.add('warning');
        }
    }

    async function fetchQuestions() {
        if (timerInterval) {
            stopTimer();
            timerBar.style.display = 'none';
        }
        isSubmitted = false;

        let subject = subjectSelect.value;
        const selectedClass = classSelect.value;
        const chapter = chapterSelect.value;
        const difficulty = difficultySelect.value;
        const numQuestions = numQuestionsSelect.value;

        if (selectedClass === 'Not selected' || subject === 'Not selected' || chapter === 'Not selected' || difficulty === 'Not selected' || numQuestions === 'Not selected') {
            showAlert('Selection Required', 'Please select all fields before proceeding.');
            return;
        }

        if (!GROQ_API_KEY) {
            showAlert('API Key Not Ready', 'API Key not loaded yet. Please wait a moment and try again.');
            return;
        }

        questionBox.innerHTML = 'Loading questions...';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submit';
        scoreDisplay.innerHTML = '';
        userAnswers = {};

        const apiSubject = (subject === 'Maths') ? 'Mathematics' : subject;

        const prompt = 'Generate ' + numQuestions + ' JEE-level multiple-choice questions for ' + selectedClass.replace('_', ' ') + ', chapter \'' + chapter + '\', subject ' + apiSubject + ', ' + difficulty + ' difficulty. Return a JSON object with a single key "questions" whose value is an array of objects. Each object must have: "question" (string), "options" (array of 4 strings), "answer" (the correct option string), "explanation" (detailed step-by-step solution).';

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + GROQ_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: "You are a JSON generator for JEE exam questions. Always respond with a JSON object containing a 'questions' array."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            if (!response.ok) {
                var errMsg = data.error?.message || 'API request failed';
                if (data.error?.failed_generation) {
                    errMsg += ' (The AI had trouble generating questions. Please try again with different selections.)';
                }
                throw new Error(errMsg);
            }

            let content = data.choices[0]?.message?.content;
            content = content.replace(/```json\n|```/g, '').trim();

            const parsedData = JSON.parse(content);
            if (Array.isArray(parsedData)) {
                questionsData = parsedData;
            } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
                questionsData = parsedData.questions;
            } else {
                var found = null;
                for (var key in parsedData) {
                    if (Array.isArray(parsedData[key]) && parsedData[key].length > 0 && parsedData[key][0].question) {
                        found = parsedData[key];
                        break;
                    }
                }
                questionsData = found || [];
            }
            if (questionsData.length === 0) {
                questionBox.innerHTML = 'Failed to parse questions from the API response. Please try again.';
                return;
            }
            renderQuestions();

            const qty = parseInt(numQuestions);
            startTimer(qty * 3);
        } catch (error) {
            console.error("Error calling Groq API:", error);
            questionBox.innerHTML = "Sorry, I couldn't fetch the questions. Please try again. If the problem persists, the API might be down.";
        }
    }

    function updateChapterSelect() {
        const selectedClass = classSelect.value;
        let selectedSubject = subjectSelect.value;

        chapterSelect.innerHTML = '<option>Not selected</option>';
        chapterSelect.disabled = true;

        const dataSubject = (selectedSubject === 'Maths') ? 'Mathematics' : selectedSubject;

        if (selectedClass !== 'Not selected' && selectedSubject !== 'Not selected' && chapterData[selectedClass] && chapterData[selectedClass][dataSubject]) {
            const chapters = chapterData[selectedClass][dataSubject];
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
            chapterSelect.disabled = false;
            $(chapterSelect).niceSelect('update');
        }
    }

    function renderQuestions() {
        questionBox.innerHTML = '';
        questionsData.forEach(function (q, index) {
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';

            let optionsHTML = '';
            q.options.forEach(function (option) {
                var escaped = escapeHtml(option);
                optionsHTML += '<label><input type="radio" name="q' + index + '" value="' + escaped + '"> ' + escaped + '</label>';
            });

            questionContainer.innerHTML = '<p><b>Q' + (index + 1) + ':</b> ' + escapeHtml(q.question) + '</p><div class="options" id="options-q' + index + '">' + optionsHTML + '</div>';
            questionBox.appendChild(questionContainer);
        });

        document.querySelectorAll('input[type="radio"]').forEach(function (input) {
            input.addEventListener('change', handleOptionChange);
        });
    }

    function handleOptionChange(event) {
        const questionIndex = event.target.name.replace('q', '');
        userAnswers[questionIndex] = event.target.value;
        submitBtn.disabled = false;
    }

    async function handleSubmit() {
        if (isSubmitted) return;
        isSubmitted = true;

        stopTimer();
        timerBar.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitted';

        let score = 0;

        questionsData.forEach(function (q, index) {
            const optionsContainer = document.getElementById('options-q' + index);
            if (!optionsContainer) return;
            const radioButtons = optionsContainer.querySelectorAll('input[name="q' + index + '"]');
            const userAnswer = userAnswers[index];

            radioButtons.forEach(function (radio) {
                radio.disabled = true;
                const label = radio.parentElement;

                if (radio.value === q.answer) {
                    label.classList.add('correct');
                    if (radio.checked) {
                        score++;
                    }
                }

                if (radio.checked && radio.value !== q.answer) {
                    label.classList.add('incorrect');
                }
            });

            var isUnattempted = !userAnswer;
            var isIncorrect = userAnswer && userAnswer !== q.answer;

            if (isUnattempted || isIncorrect) {
                var explainBtn = document.createElement('button');
                explainBtn.className = 'explain-btn';
                explainBtn.textContent = 'Explain Q' + (index + 1);
                explainBtn.dataset.index = index;
                explainBtn.addEventListener('click', function () {
                    showExplanation(index);
                });
                optionsContainer.appendChild(explainBtn);
            }
        });

        finalScoreText.innerHTML = 'Your score = ' + score + '/' + questionsData.length;
        $('#scoreModal').modal('show');
    }

    async function showExplanation(index) {
        var q = questionsData[index];
        if (!q) return;

        var userAnswer = escapeHtml(userAnswers[index] || 'Not attempted');
        var questionText = escapeHtml(q.question);
        var correctAnswer = escapeHtml(q.answer);

        if (q.explanation) {
            explanationBody.innerHTML = '<p><strong>Question:</strong> ' + questionText + '</p><p><strong>Your Answer:</strong> ' + userAnswer + '</p><p><strong>Correct Answer:</strong> ' + correctAnswer + '</p><hr><p><strong>Explanation:</strong></p><p>' + q.explanation + '</p>';
            $('#explanationModal').modal('show');
            return;
        }

        explanationBody.innerHTML = 'Loading explanation...';
        $('#explanationModal').modal('show');

        try {
            var prompt = 'Explain the answer to this JEE question in detail:\n\nQuestion: ' + q.question + '\nOptions: ' + JSON.stringify(q.options) + '\nCorrect Answer: ' + q.answer + '\n\nProvide a clear, step-by-step explanation suitable for a JEE aspirant.';

            var response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + GROQ_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: "You are a JEE expert tutor. Provide detailed, clear explanations for exam questions."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.3
                })
            });

            var data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'API request failed');
            }

            var explanation = data.choices[0]?.message?.content.trim() || 'Explanation not available.';
            q.explanation = explanation;

            explanationBody.innerHTML = '<p><strong>Question:</strong> ' + questionText + '</p><p><strong>Your Answer:</strong> ' + userAnswer + '</p><p><strong>Correct Answer:</strong> ' + correctAnswer + '</p><hr><p><strong>Explanation:</strong></p><p>' + explanation + '</p>';
        } catch (error) {
            console.error("Error fetching explanation:", error);
            explanationBody.innerHTML = 'Sorry, could not load the explanation. Please try again.';
        }
    }
});