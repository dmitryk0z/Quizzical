import Question from "./components/Question.js"
import React from "react"

import {nanoid} from "nanoid"
import {decode} from "html-entities"
import Confetti from "react-confetti"

const GET_DATA = "https://opentdb.com/api.php?amount=5&category=9&type=multiple"

export default function App() {
    const [quizOn, setQuizOn] = React.useState(
        () => JSON.parse(localStorage.getItem("quizOn")) || false
    )
    const [newQuestionData, setNewQuestionData] = React.useState([])
    const [modQuestionData, setModQuestionData] = React.useState(
        () => JSON.parse(localStorage.getItem("modQuestionData")) || []
    )
    const [displayWarning, setDisplayWarning] = React.useState(
        () => JSON.parse(localStorage.getItem("displayWarning")) || false
    )
    const [displayResult, setDisplayResult] = React.useState(
        () => JSON.parse(localStorage.getItem("displayResult")) || false
    )

    React.useEffect(() => {
        fetch(GET_DATA)
        .then(res => res.json())
        .then(data => setNewQuestionData(data.results))
        localStorage.setItem("quizOn", JSON.stringify(quizOn))
        localStorage.setItem("modQuestionData", JSON.stringify(modQuestionData))
        localStorage.setItem("displayWarning", JSON.stringify(displayWarning))
        localStorage.setItem("displayResult", JSON.stringify(displayResult))
    }, [quizOn, modQuestionData, displayWarning, displayResult])

    function startQuiz() {
        setQuizOn(!quizOn)
        setModQuestionData(sortQuestionsData())
    }
    
    function sortQuestionsData() {
        const sortedQuestions = newQuestionData.map(questionObj => {
            const allAnswersArr = createAllAnswersArr(questionObj.incorrect_answers, questionObj.correct_answer)
            return {
                id: nanoid(),
                questionText: questionObj.question,
                correctAnswer: questionObj.correct_answer,
                incorrectAnswers: questionObj.incorrect_answers,
                allAnswers: allAnswersArr,
                isSelected: false
            }
        })
        return decodeHTMLentities(sortedQuestions)
    }

    function createAllAnswersArr(incorrectAnswers, correctAnswer) {
        const answers = shuffle([...incorrectAnswers, correctAnswer])
        const answersMod = answers.map(answer => {
            return {
                id: nanoid(),
                text: answer,
                isHeld: false
            }
        })
        return answersMod
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
        return array
    }

    function decodeHTMLentities(questions) {
        const decodedQuestions = questions.map(questionObj => {
            const decodedAnswers = questionObj.allAnswers.map(answerObj => {
                return {
                    ...answerObj,
                    text: decode(answerObj.text)
                }
            })
            return {
                ...questionObj,
                allAnswers: decodedAnswers,
                correctAnswer: decode(questionObj.correctAnswer),
                questionText: decode(questionObj.questionText)
            }
        })
        return decodedQuestions
    }

    function selectAnswer(answerID, questionID) {
        setModQuestionData(prevModQuestionData => prevModQuestionData.map(questionObj => {
            const answerData = questionObj.allAnswers.map(answerObj => {
                if (questionObj.id === questionID) {
                    return answerObj.id === answerID ? {...answerObj, isHeld: !answerObj.isHeld} : {...answerObj, isHeld: false}
                }
                return answerObj
            })

            return {
                ...questionObj,
                isSelected: answerData.every(answerObj => !answerObj.isHeld) ? false : true,
                allAnswers: answerData
            }
        }))
    }

    function allQuestionsAnswered() {
        const allSelected = modQuestionData.every(questionObj => questionObj.isSelected)
        setDisplayResult(allSelected)
        setDisplayWarning(!allSelected)
    }

    function checkAnswers() {
        let numCorrectAnswers = 0
        modQuestionData.forEach(questionObj => {
            questionObj.allAnswers.forEach(answerObj => {
                (questionObj.correctAnswer === answerObj.text && answerObj.isHeld) && numCorrectAnswers++
            })
        })
        return numCorrectAnswers
    }

    function newQuestions() {
        setModQuestionData(sortQuestionsData())
        setDisplayWarning(false)
    }

    function playAgain() {
        setQuizOn(false)
        setDisplayResult(false)
        setDisplayWarning(false)
    }

    const quizQuestions = modQuestionData.map((questionObj, index) => {
        return (
            <Question
                key={index}
                id={questionObj.id}
                questionText={questionObj.questionText}
                correctAnswer={questionObj.correctAnswer}
                incorrectAnswers={questionObj.incorrectAnswers}
                allAnswers={questionObj.allAnswers}
                displayResult={displayResult}
                displayWarning={displayWarning}
                isSelected={questionObj.isSelected}
                toggle={selectAnswer}
            />
        )
    })

    return (
        <main>
            {(checkAnswers() === 5 && quizOn && displayResult) && <Confetti width={window.innerWidth} height={window.innerHeight}/>}
            <img src={require("./images/blob-top-quiz.png")} className="quiz-img-top" alt="Top Blob"/>
            <img src={require("./images/blob-bot-quiz.png")} className="quiz-img-bot" alt="Bottom Blob"/>
            {
                quizOn ? 
                <div className="quizOn">
                    <div className="quizOn-warning-msg">
                        {displayWarning && <p>Please answer all questions</p>}
                    </div>
                    {quizQuestions}
                    {
                        displayResult ?
                        <div className="quizOn-control-btns">
                            <p>You scored {checkAnswers()}/5 correct answers</p>
                            <button onClick={playAgain}>Play Again</button>
                        </div>
                        :
                        <div className="quizOn-control-btns">
                            <button onClick={allQuestionsAnswered}>Check Answers</button>
                            <button onClick={newQuestions}>New Questions</button>
                        </div>
                    }
                </div>
                :
                <div className="quizOff">
                    <h1 className="quizOff-title">Quizzical</h1>
                    <span className="quizOff-description">Let's test your knowledge!</span>
                    <button
                        className="quizOff-startQuiz-btn"
                        onClick={startQuiz}
                    >
                        Start Quiz
                    </button>
                </div>
            }
        </main>
    )
}
