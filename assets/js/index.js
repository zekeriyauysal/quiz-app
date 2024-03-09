document.addEventListener("DOMContentLoaded", function () {
  const quizContainer = document.getElementById("quiz-container");
  let currentQuestionIndex = 0;
  let questions = [];
  let answers = [];
  let timerId;

  function getQuizQuestions() {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then((data) => {
        questions = data.slice(0, 10).map((question) => ({
          title: question.title,
          options: question.body.split("\n").map((option) => option.trim()),
        }));
        displayQuestion(questions[currentQuestionIndex]);
      })
      .catch((error) => console.error("Error:", error));
  }
  function displayQuestion(question) {
    clearTimeout(timerId);
    quizContainer.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between">
                 <span>Soru ${currentQuestionIndex + 1}</span>
                 <span id="timer"></span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${question.title}</h5>
                    <div id="options-container" class="mt-4">
                        ${question.options
                          .map(
                            (option, index) => `
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="questionOption" id="option${index}" data-index="${index}" disabled>
                                <label class="form-check-label" for="option${index}">
                                    ${String.fromCharCode(65 + index)}) ${option}
                                </label>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                    <button id="next-btn" class="btn btn-primary mt-3" disabled>İleri</button>
                </div>
            </div>
        `;

    document.getElementById("next-btn").addEventListener("click", goToNextQuestion);
    startReadingPeriod();
  }

  function startReadingPeriod() {
    let readTime = 10;
    updateTimer(readTime);

    timerId = setInterval(() => {
      readTime--;
      updateTimer(readTime);
      if (readTime <= 0) {
        clearInterval(timerId);
        document.getElementById("next-btn").disabled = false;
        startAnsweringPeriod();
      }
    }, 1000);
  }

  function startAnsweringPeriod() {
    document.querySelectorAll("#options-container .form-check-input").forEach((input) => {
      input.disabled = false;
    });

    let answerTime = 30;
    updateTimer(answerTime);

    timerId = setInterval(() => {
      answerTime--;
      updateTimer(answerTime);
      if (answerTime <= 0) {
        clearInterval(timerId);
        goToNextQuestion();
      }
    }, 1000);
  }

  function updateTimer(time) {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = `Kalan Süre: ${time}s`;
  }
  function saveAnswer() {
    const selectedOption = document.querySelector('input[name="questionOption"]:checked');
    answers[currentQuestionIndex] = selectedOption ? selectedOption.getAttribute("data-index") : "Not answered";
  }
  function displayResults() {
    let resultsHTML = `<div class="alert alert-success" role="alert">Quiz Sonuçları</div><ul class="list-group">`;
    answers.forEach((answer, index) => {
      const questionTitle = questions[index].title;
      const userAnswer = questions[index].options[answer] || "Boş bırakıldı";
      resultsHTML += `<li class="list-group-item">Soru ${index + 1}: ${questionTitle}<br/>Verdiğiniz Cevap: ${userAnswer}</li>`;
    });
    resultsHTML += `</ul>`;
    quizContainer.innerHTML = resultsHTML;
  }

  function goToNextQuestion() {
    saveAnswer();
    clearInterval(timerId);
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      displayQuestion(questions[currentQuestionIndex]);
    } else {
      displayResults();
    }
  }
  getQuizQuestions();
});
