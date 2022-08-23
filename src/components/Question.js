import React from "react"

export default function QuestionsPage(props) {
    const listOfAnswers = props.allAnswers.map((answer, index)  => {
        let styleAnswers = {}
        if (answer.text === props.correctAnswer) {
            styleAnswers = {
                backgroundColor: "#94D7A2",
                border: "none"
            }
        } else if (answer.isHeld && answer.text !== props.correctAnswer) {
            styleAnswers = {
                backgroundColor: "#F8BCBC",
                opacity: 0.5,
                border: "none"
            }
        } else {
            styleAnswers = {
                opacity: 0.5
            }
        }

        if (!props.displayResult) {
            return (
                <li 
                    key={index} 
                    onClick={() => props.toggle(answer.id, props.id)} 
                    className={answer.isHeld ? "quizOn-answer-isSelected" : "quizOn-answer-notSelected"}
                >
                    {answer.text}
                </li>
            )
        }

        return (
            <li
                key={index}
                className={answer.isHeld ? "quizOn-answer-isSelected" : "quizOn-answer-notSelected"}
                style={styleAnswers}
            >
                {answer.text}
            </li>
        )
    })

    const styleQuestions = {
        color: props.displayWarning && !props.isSelected ? "#EF5350" : ""
    }

    return (
        <div className="quizOn-question">
            <h3 className="quizOn-question-text" style={styleQuestions}>{props.questionText}</h3>
            <ul className="quizOn-question-answers">{listOfAnswers}</ul>
            <hr/>
        </div>
    )
}
