let inputColor = document.querySelectorAll('.input__color')
let guideInput = document.querySelector('#guide__mode')
let devInput = document.querySelector('#dev__mode')
let section = document.querySelector('.field')
var cards = NaN

let inputsAmount = document.querySelectorAll('.input__amount') 
let btnStart = document.querySelector('#btn__start').addEventListener('click', start) 
let btnQuit = document.querySelector('#btn__quit')

var gameState = NaN
var rows = 0
var cols = 0
var field = []
var correctCards = 4
var steps = 0

var guideMode = NaN
var devMode = NaN

inputsAmount.forEach(el => {
    el.addEventListener('change', ()=>{
        if (el.value<3) {
            el.value = 3
        } else if (el.value>20) {
            el.value = 20
        }
    })
});


function restart() {
    btnQuit.removeEventListener('click', restart)
    let container = document.querySelector('.field__container')
    container.style.opacity = 0
    setTimeout(() => {
        container.remove()
        gameState = NaN
        field = []
        correctCards = 4
        steps = 0
        gameState = NaN
    }, 500);
}

/* CREATE START FIELD */
function start() {
    if (gameState) {
        return
    }

    for (let i = 0; i < 4; i++) {
        for (let t = 0; t < 4; t++) {
            if (i == t) {
                continue
            }
            if (inputColor[i].value == inputColor[t].value) {
                alert('Ты зачем выбрал одинаковые цвета?')
                return
            }
        }
    }
    gameState = 'start'

    guideMode = guideInput.checked
    devMode = devInput.checked
    
    rows = inputsAmount[0].value
    cols = inputsAmount[1].value

    /* CREATE GAME FIELD */
    let container = document.createElement('div')
    container.className = 'container field__container'
    section.append(container)
    for (let i = 0; i < (cols*rows); i++) {
        let div = document.createElement('div')
        div.className = 'color'
        container.append(div)
    }
    for (let i = 0; i < rows; i++) {
        field[i] = []
        for (let t = 0; t < cols; t++) {
            field[i][t] = [NaN, NaN, NaN]
        }
    }
    
    container.style.height = container.offsetWidth*(rows/cols) + 'px'   
    container.classList.add('field__col-'+cols)

    /* GET COLORS FOR CORNERS */
    let corners = []
    let i = 0
    inputColor.forEach(el => {
        let corner = hex2rgb(el.value)
        corners[i] = corner
        i++
    })
    
    fillRow(corners[0], corners[1], 0)
    fillRow(corners[2], corners[3], rows-1)
    for (let i = 0; i < cols; i++) {    
        fillCol(field[0][i], field[rows-1][i], i)
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let el = field[r][c]
            field[r][c] = rgb2hex(el)
        }
    }


    cards = document.querySelectorAll('.color')
    /* SET COLOR FOR CARD */
    let counter = 0
    for (let i = 0; i < rows; i++) {
        for (let t = 0; t < cols; t++) {
            let el = field[i][t]
            let card = cards[counter] 
            let delay = (i + t) * 0.1
            card.style.transitionDelay = ` ${delay}s`
            card.style.order = counter
            if(devMode) {card.innerText = el}
            card.style.backgroundColor = el
            counter++
        } 
    }

    /* SET ORDER FOR CORNERS CARDS */
    cards[0].classList.add('blocked')
    cards[cols-1].classList.add('blocked')
    cards[cols*rows - cols].classList.add('blocked')
    cards[cols*rows-1].classList.add('blocked')
    
    cards[0].style.order = 0
    cards[cols-1].style.order = cols-1
    cards[cols*rows - cols].style.order = cols*rows - cols
    cards[cols*rows-1].style.order = cols*rows-1

    cards.forEach(el => {
        el.style.opacity = 1
    });

    /* GENERATE ARREY FOR RANDOM ORDER OF CARDS */
    let randArr = []
    for (let i = 0; i < cols*rows; i++) {
        if(cornerRule(i)) {
            let randInt = Math.round(Math.random()*randArr.length)
            randArr.splice(randInt, 0, i)
        }
    }

    let timeout = (Number(cols) + Number(rows))*100 
    let colorTimeout = timeout + 1500

    /* HIDE CARDS */
    setTimeout(() => {
        cards.forEach(el => {
            if(!el.classList.contains('blocked')) {
                el.style.opacity = 0
            }
        });
    }, colorTimeout);

    colorTimeout+=timeout+500

    setTimeout(() => {
        for (let i = 0; i < cards.length; i++) {
            if (cornerRule(i)) {
                /* SET CARDS IN RANDOM ORDER */
                cards[i].style.order = randArr.pop()

                /* CHECK FOR CARDS WITH CORRECT COLORS */
                let pl = order2place(cards[i].style.order);
                let bg = rgbParse(cards[i].style.backgroundColor)
                let hex = rgb2hex(bg)

                if(field[pl[0]][pl[1]] == hex) {
                    correctCards++
                    if(guideMode) {cards[i].classList.add('card__guide')}
                }
            }
        }
    }, colorTimeout);
    
    colorTimeout+=20

    setTimeout(() => {
        cards.forEach(el => {
            el.style.opacity = 1
        });
        cards.forEach(el => {
            el.addEventListener('click', main)
        });
    }, colorTimeout);
    
    colorTimeout+=timeout
    setTimeout(() => {
        cards.forEach(el => {
            gameState = 'play'
            el.style.transition = 'all .2s'
            btnQuit.addEventListener('click', restart) 
        });
    }, colorTimeout);
}

/* MAIN LOGIC OF GAME */
function main(event) {
    if(gameState != 'play') {
        return
    }
    if(event.target.classList.contains('blocked')) {
        return
    }
    if(event.target.classList.contains('active')) {
        event.target.classList.remove('active')
        return
    }
    
    /* CHECK FOR ACTIVE CARDS */
    let card1 = document.querySelector('.field__container').querySelector('.active')
    if(!card1) {
        event.target.classList.add('active')
        return
    }
    card1.classList.remove('active')

    let card2 = event.target

    let cardObj1 = {
        bg: card1.style.backgroundColor,
        pl: order2place(card1.style.order),
        
    }
    
    let cardObj2 = {
        bg: card2.style.backgroundColor,
        pl: order2place(card2.style.order),
    }
    /* CHECK FOR CORRECT COLOR OF CARD */
    cardObj1.correct = rgb2hex(rgbParse(cardObj1.bg)) == field[cardObj1.pl[0]][cardObj1.pl[1]]
    cardObj2.correct = rgb2hex(rgbParse(cardObj2.bg)) == field[cardObj2.pl[0]][cardObj2.pl[1]]
    /* CHECK FOR CORRECT FUTURE COLOR OF CARD */
    cardObj1.willCorrect = rgb2hex(rgbParse(cardObj1.bg)) == field[cardObj2.pl[0]][cardObj2.pl[1]]
    cardObj2.willCorrect = rgb2hex(rgbParse(cardObj2.bg)) == field[cardObj1.pl[0]][cardObj1.pl[1]]
    
    if (cardObj1.correct) {
        correctCards--
        if(guideMode) {card1.classList.remove('card__guide')}
    } else if (cardObj1.willCorrect) {
        correctCards++
        if(guideMode) {card2.classList.add('card__guide')}
    }
    if (cardObj2.correct) {
        correctCards--
        if(guideMode) {card2.classList.remove('card__guide')}
    } else if (cardObj2.willCorrect) {
        correctCards++
        if(guideMode) {card1.classList.add('card__guide')}
    }

    card2.style.backgroundColor = cardObj1.bg
    card1.style.backgroundColor = cardObj2.bg

    steps++

    if (correctCards == cols*rows) {
        gameState = win
        win()
    }
}

function win() {
    setTimeout(() => {
        alert('Ну наконец-то ты победил. Всего шагов: ' + steps)
    }, 600);
}

/* CONVERTS ORDER OF CARD TO COORDS (X, Y) */
function order2place(order) {
    let x = Math.floor(order / cols)
    let y = order % cols
    return [x, y]
}


/* CHECKS FOR A CORNER ORDER */
function cornerRule(i) {
    switch (i) {
        case 0:
            return false
        case cols-1:
            return false
        case cols*rows - cols:
            return false 
        case cols*rows-1:    
            return false
        default:
            return true
    }
}


function fillRow(color1, color2, rowId) {
    /* i-chanel, c-col */
    for (let i = 0; i < 3; i++) {
        let chanel = (color1[i] - color2[i]) / (cols-1)
        for (let c = 0; c < cols; c++) {
            let value = color1[i] - chanel * c
            field[rowId][c][i] = Math.round(value)
        }
    }
}

function fillCol(color1, color2, colId) {
    /* i-chanel, r-row */
    for (let i = 0; i < 3; i++) {
        let chanel = (color1[i] - color2[i]) / (rows-1)
        for (let r = 1; r < rows-1; r++) {
            let value = color1[i] - chanel * r
            field[r][colId][i] = Math.round(value)
        }
    }
}


function hex2rgb(hex) {
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let result = [ 
        parseInt(rgb[1], 16),
        parseInt(rgb[2], 16),
        parseInt(rgb[3], 16),
    ]
    return result
}

function rgb2hex(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

function rgbParse(rgb) {
    let result = rgb.match(/[0-9]{1,}/g)
    return [
        Number(result[0]),
        Number(result[1]),
        Number(result[2]),
    ]

}