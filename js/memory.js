"use strict";
let firstClickedCard = "";
let secondClickedCard = "";

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
        username = "onbekende ;-)";
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

let hr = 0;
let min = 0;
let sec = 0;
let stoptime = true;

function startTimer() {
    if (stoptime === true) {
        stoptime = false;
        timerCycle();
    }
}

function timerCycle() {
    if (stoptime === false) {
        sec = parseInt(sec);
        min = parseInt(min);
        hr = parseInt(hr);

        sec = sec + 1;

        if (sec === 60) {
            min = min + 1;
            sec = 0;
        }
        if (min === 60) {
            hr = hr + 1;
            min = 0;
            sec = 0;
        }
        if (sec < 10 || sec === 0) {
            sec = '0' + sec;
        }
        if (min < 10 || min === 0) {
            min = '0' + min;
        }
        if (hr < 10 || hr === 0) {
            hr = '0' + hr;
        }
        document.getElementById('timer').innerHTML = hr + ':' + min + ':' + sec;
        setTimeout("timerCycle()", 1000);
    }
}

function resetTimer() {
    sec = 0;
    min = 0;
    hr = 0;
    document.getElementById('timer').innerHTML = '00:00:00';
}

//Function to evaluate selection made in Board Select dropdown.
function onSelectBoardSize(e) {
    const selectedBoardSize = parseInt(e.target.value);
    const numberOfCards = Math.floor(selectedBoardSize * selectedBoardSize / 2);
    const boardClass = 'board' + e.target.value;
    const cardDeck = getShuffledCardDeck(numberOfCards);
    displayMemoryBoard(cardDeck, boardClass);
    resetTimer();
    startTimer();
    displayUsername();
}

function getShuffledCardDeck(numberOfCards) {
    console.log(myCardArray);
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
        let clickedCard = e.target.parentNode.firstChild.getAttribute("name");
        console.log(clickedCard);
        matchCards(clickedCard);
    }
}

//Function to check if cards match.
function matchCards(clickedCard) {
    let score = 0;
    if (firstClickedCard === ""){
        firstClickedCard = clickedCard;
    }
    else {
        if (secondClickedCard === "") {
            secondClickedCard = clickedCard;
        }
    }
    if (firstClickedCard === secondClickedCard) {
        console.log("2 gelijke kaartjes");
        score++;
    } if (firstClickedCard && secondClickedCard && firstClickedCard !== secondClickedCard){
        pauseGameIncorrect();
        setTimeout(coverIncorrectMatch, 1500);
        setTimeout(resumeGame, 3500);
        console.log("Fout!");
    }
}

function pauseGameIncorrect() {
    myField.removeEventListener("click", onClickCard);
}

function resumeGame() {
    myField.addEventListener("click", onClickCard);
}

function coverIncorrectMatch() {
    const cardOne = document.getElementsByClassName("uncovered");
    const cardTwo = document.getElementsByClassName("uncovered");
    cardOne.setAttribute("class", "covered");
    cardTwo.setAttribute("class", "covered");
    setTimeout(resetChosenCards, 1500);
}

function resetChosenCards() {
    firstClickedCard = "";
    secondClickedCard = "";
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

