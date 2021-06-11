"use strict";
let firstClickedCard = "";
let secondClickedCard = "";
let score = 0;
let tries = 0;
let maxMatches = 0;

let myCardArray;
const myField = document.getElementById("field");
const mySelect = document.getElementById("selectBoard");
myField.addEventListener("click", onClickCard);
mySelect.addEventListener("change", onSelectBoardSize);
document.addEventListener("DOMContentLoaded", async function () {
    myCardArray = await fetchCards();
}, getUsername());

function fetchCards() {
    return fetch("js/cards.json")
        .then(response => response.json())
        .then(data => data.map(card => new Card(card)));
}

class Card {
    constructor(cardObject) {
        this.card1 = cardObject.card1;
        this.card2 = cardObject.card2;
        this.set = cardObject.set;
        this.sound = cardObject.sound;
    }
}

//Function to get username and store it in localStorage.
function getUsername() {
    let username = prompt('Wat is uw naam?');
    if (!username) {
        username = "NoName";
    }
    localStorage.setItem("username", username);
    return username;
}

function displayUsername() {
    if (localStorage.getItem("username")) {
        document.getElementById("info").innerHTML =
            "Heel veel succes " + localStorage.getItem("username") + "!";
    }
}

function displayTries() {
    document.getElementById("tries").innerHTML = 'Aantal pogingen: ' + tries +
        '. Aantal succesvolle pogingen: ' + score;
}

function displayHighscore() {
    if (localStorage.getItem("highscore")) {
        document.getElementById("highscore").innerHTML =
            "De beste highscore is: " + localStorage.getItem("highscore") + " punten in " + localStorage.getItem("time", timeToString(elapsedTime) + "door " + localStorage.getItem("username"));
    }
}

function timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let diffInMs = (diffInSec - ss) * 100;
    let ms = Math.floor(diffInMs);

    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");
    let formattedMS = ms.toString().padStart(2, "0");

    return `${formattedMM}:${formattedSS}:${formattedMS}`;
}

// Declare variables to use in our functions below

let startTime;
let elapsedTime = 0;
let timerInterval;

// Create function to modify innerHTML

function displayTimer(txt) {
    document.getElementById("timer").innerHTML = txt;
}

// Create "start", "pause" and "reset" functions

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function printTime() {
        elapsedTime = Date.now() - startTime;
        displayTimer(timeToString(elapsedTime));
    }, 10);
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    displayTimer("00:00:00");
    elapsedTime = 0;
}

function resetTries() {
    tries = 0;
}

//Function to evaluate selection made in Board Select dropdown.
function onSelectBoardSize(e) {
    const selectedBoardSize = parseInt(e.target.value);
    const numberOfCards = Math.floor(selectedBoardSize * selectedBoardSize / 2);
    maxMatches = Math.floor(selectedBoardSize * selectedBoardSize / 2);
    const boardClass = 'card board' + e.target.value;
    const cardDeck = getShuffledCardDeck(numberOfCards);
    displayMemoryBoard(cardDeck, boardClass);
    resetTimer();
    startTimer()
    displayUsername();
    resetTries();
    displayTries();
    displayHighscore();
}

function getShuffledCardDeck(numberOfCards) {
    shuffle(myCardArray);
    const correctCardsArray = myCardArray.slice(0, numberOfCards);
    const myCardSet = correctCardsArray.concat(correctCardsArray);
    const cardDeck = myCardSet.map(card => new Card(card)); //To prevent reference duplication.
    shuffle(cardDeck);
    return cardDeck;
}

//Function to populate the field based on selected field size.
function displayMemoryBoard(cardDeck, boardClass) {
    myField.innerHTML = "";
    cardDeck.forEach(card => {
        myField.appendChild(getNewCardElement(card, boardClass));
    });
}

function getNewCardElement(card, boardClass) {
    const newTile = document.createElement("div");
    const newCard = document.createElement("img");
    const cover = document.createElement("img");
    newTile.setAttribute("class", boardClass);
    const imageURL = "img/" + card.card1 + ".jpg";
    newCard.setAttribute("src", imageURL);
    newCard.setAttribute("class", "animal");
    cover.setAttribute("src", "img/membg.jpg");
    cover.setAttribute("class", "covered");
    cover.setAttribute("name", card.card1);
    newCard.setAttribute("name", card.card1);
    newTile.appendChild(newCard);
    newTile.appendChild(cover);
    return newTile;
}

//Function to 'flip' the memory card.
function onClickCard(e) {
    if (e.target.className === "covered") {
        e.target.className = "uncovered";
        playAudio('snd/' + e.target.name + '.wav');
        matchCards(e.target.parentNode);
    }
}

//Function to play audio when card is clicked.
function playAudio(url) {
    new Audio(url).play();
}

//Function to check if cards match.
function matchCards(clickedParentDiv) {
    const clickedCard = clickedParentDiv.firstChild.getAttribute("name");
    if (firstClickedCard === "") {
        firstClickedCard = clickedCard;
    } else if (secondClickedCard === "") {
        secondClickedCard = clickedCard;
    }
    clickedParentDiv.classList.add("is-flipped");
    if (firstClickedCard === secondClickedCard) {
        score++;
        pauseGame();
        setTimeout(correctMatch, 1000);
        setTimeout(resumeGame, 1500);
    }
    if (firstClickedCard && secondClickedCard && firstClickedCard !== secondClickedCard) {
        pauseGame();
        setTimeout(coverIncorrectMatch, 1000);
        setTimeout(resumeGame, 1500);
    }
}

function pauseGame() {
    myField.removeEventListener("click", onClickCard);

}

function resumeGame() {
    myField.addEventListener("click", onClickCard);
    tries++;
    displayTries();
    if (score === maxMatches) {
        endGame();
    }
}

let highscore;
function verifyHighscore() {
    if (score === tries) {
        highscore = (score - 500) + (elapsedTime / 10);
    } else {
        highscore = score + (elapsedTime / 10);
    }
    if (!localStorage.getItem("highscore") && !localStorage.getItem("time") && highscore < localStorage.getItem("highscore") && timeToString(elapsedTime) < localStorage.getItem("time")) {
        localStorage.setItem("highscore", highscore);
        localStorage.setItem("time", timeToString(elapsedTime));
    } else {
        localStorage.setItem("highscore", highscore);
        localStorage.setItem("time", timeToString(elapsedTime));
    }
}

function endGame() {
    pauseTimer();
    verifyHighscore();
    alert("Gewonnen! Jouw highscore is " + highscore + " in " + timeToString(elapsedTime) + ".");
    const r = confirm("Wil je nog een keer spelen?");
    if (r === true) {
        location.reload();
    } else {
        alert("Bedankt voor het spelen " + localStorage.getItem("username") + ". Wil je toch weer spelen, ververs dan de pagina.");
    }
}

function coverIncorrectMatch() {
    const uncoveredList = document.querySelectorAll(".uncovered:not(.matched)");
    Array.from(uncoveredList).forEach((element) => {
        element.setAttribute("class", "covered");
    });
    resetChosenCards();
}

function correctMatch() {
    const uncoveredList = document.querySelectorAll(".uncovered:not(.matched)");
    Array.from(uncoveredList).forEach((element) => {
        element.parentNode.firstChild.setAttribute("class", "matched");
        element.remove();
    });

    resetChosenCards();
}

function resetChosenCards() {
    firstClickedCard = "";
    secondClickedCard = "";
    Array.from(document.querySelectorAll('.is-flipped')).forEach((element) => {
        element.classList.remove("is-flipped");
    });
}

function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

