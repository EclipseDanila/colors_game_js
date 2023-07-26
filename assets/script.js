/* Элементы на сайте */
// Модальное окно с настройками
let settingsSection = document.querySelector('.settings')
// Секция помошник
let helperSection = document.querySelector('.helper')
// Сообщение о победе
let winSection = document.querySelector('.win')
// Кнопка для включения режима обучения
let modeInput = document.querySelector('#mode_input')
// Инпуты для выбора цвета 
let inputColor = document.querySelectorAll('.input__color')
// Поле для вывода цветов
let section = document.querySelector('.field')
// Инпуты для выбора количества рядов и колонок
let inputsAmount = document.querySelectorAll('.input__amount') 
// Кнопка начала игры
let btnStart = document.querySelector('#btn__start').addEventListener('click', start) 
// Кнопка окончания игры
let btnQuit = document.querySelector('#btn__quit')
// Кнопка окончания игры
let stepsOutput = document.querySelector('#steps_output')

// Карточки с цветами
var cards = NaN
// Текущее состояние игры
var gameState = NaN
// Количество рядов
var rows = 0
// Количество колонок
var cols = 0
// Массив со значениями цветов для карточек
var field = []
// Количество карточек с правильным цветом
var correctCards = 4
// Количество шагов которые сделал пользователь
var steps = 0
// Режим обучения
var guideMode = false


/* Вспомогательные функции */
// Функция переводит код цвета из шестнадцатиричного формата в формат rgb
function hex2rgb(hex) {
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let result = [ 
        parseInt(rgb[1], 16),
        parseInt(rgb[2], 16),
        parseInt(rgb[3], 16),
    ]
    return result
}

// Функция переводит код цвета из формата rgb в шестнадцатиричного формат
function rgb2hex(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

// Функция создаёт массив на основе кода цвета в формате rgb
function rgbParse(rgb) {
    let result = rgb.match(/[0-9]{1,}/g)
    return [
        Number(result[0]),
        Number(result[1]),
        Number(result[2]),
    ]
}

// Функция конвертирует порядковый номер элемента 
// в массив с координатами [x, y]
function order2place(order) {
    let x = Math.floor(order / cols)
    let y = order % cols
    return [x, y]
}

// Функция определяет 
// является ли текущий элемент угловым
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

// Функция заполняет ряд цветовыми элементами
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

// Функция заполняет колонку цветовыми элементами
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

// Переключение режима обучения
modeInput.addEventListener('click', () => {
    if (!gameState) {
        modeInput.classList.toggle('active')
        guideMode = !guideMode
    }
})
// Слушатель события изменения значения
// инпутов выбора количества рядов и колонок
inputsAmount.forEach(el => {
    el.addEventListener('change', ()=>{
        if (el.value<3) {
            el.value = 3
        } else if (el.value>20) {
            el.value = 20
        }
    })
});

/* Функция для перезапуска игрового процесса */
// Возвращает переменные игры в исходное состояние
function restart() {
    stepsOutput.innerHTML = 0
    settingsSection.style.display = 'flex'
    settingsSection.classList.add('active')
    helperSection.style.opacity = '0'
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

// Функция начала игрового процесса
function start() {
    // Игра запустится только если состояние игры рввно "NULL"
    if (gameState) {
        return
    }
    /* Проверка на одинаковые цвета введенные пользователем */
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
    // Переключение игрового режима после прохождения всех проверок
    gameState = 'start'
    // Открытие секции помошника
    helperSection.style.opacity = '1'
    // Скрытие модального окна с настройками
    settingsSection.classList.remove('active')
    setTimeout(() => {
        settingsSection.style.display = 'none'
    }, 400);
    
    /* Создание игрового поля */
    // Определение количества рядов и колонок
    rows = inputsAmount[0].value
    cols = inputsAmount[1].value
    // Создание контейнера для вывода карточек с цветом
    let container = document.createElement('div')
    container.className = 'field__container container'
    section.append(container)
    // Заполнение матрицы с цветами пустыми элементами
    for (let i = 0; i < rows; i++) {
        field[i] = []
        for (let t = 0; t < cols; t++) {
            field[i][t] = [NaN, NaN, NaN]
        }
    }
    
    // Расчет размеров игрового поля
    // Высота окна пользователя
    let winHeight = window.innerHeight - 40
    // Ширина игрового поля
    let containerWidth = container.offsetWidth
    // Если игровое поле полностью не помещается то меняем его размеры
    if (winHeight < containerWidth*(rows/cols)) {
        console.log('Не хватает высоты');
        containerWidth = winHeight*(cols/rows)
        container.style.width = containerWidth + 'px'
    }
    container.style.height = containerWidth*(rows/cols) + 'px'   
    container.classList.add('field__col-'+cols)

    /* Заполнение матрицы */
    // Заполнение угловых элементов 
    let corners = []
    let i = 0
    inputColor.forEach(el => {
        let corner = hex2rgb(el.value)
        corners[i] = corner
        i++
    })
    // Заполнение первого и последнего рядов матрицы цветами
    fillRow(corners[0], corners[1], 0)
    fillRow(corners[2], corners[3], rows-1)
    for (let i = 0; i < cols; i++) {    
        fillCol(field[0][i], field[rows-1][i], i)
    }
    // Преобразование каждого элемента (цвета) 
    // матрицы в шестнадцатиричный формат 
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let el = field[r][c]
            field[r][c] = rgb2hex(el)
        }
    }

    // Создание карточек
    for (let i = 0; i < (cols*rows); i++) {
        let div = document.createElement('div')
        div.className = 'color'
        container.append(div)
    }
    // Получение созданных карточек
    cards = document.querySelectorAll('.color')
    
    // Заполнение карточек цветами
    let counter = 0
    for (let i = 0; i < rows; i++) {
        for (let t = 0; t < cols; t++) {
            let el = field[i][t]
            let card = cards[counter] 
            let delay = (i + t) * 0.1
            card.style.transitionDelay = ` ${delay}s`
            card.style.order = counter
            card.style.backgroundColor = el
            counter++
        } 
    }

    // Блокировка угловых элементов
    cards[0].classList.add('blocked')
    cards[cols-1].classList.add('blocked')
    cards[cols*rows - cols].classList.add('blocked')
    cards[cols*rows-1].classList.add('blocked')
    // Установка позиции угловых элементов на игровом поле
    cards[0].style.order = 0
    cards[cols-1].style.order = cols-1
    cards[cols*rows - cols].style.order = cols*rows - cols
    cards[cols*rows-1].style.order = cols*rows-1

    // Отображение правильного игрового поля для пользователя
    container.style.opacity = 1

    // Создание массива из случайных позиций элементов
    let randArr = []
    for (let i = 0; i < cols*rows; i++) {
        if(cornerRule(i)) {
            let randInt = Math.round(Math.random()*randArr.length)
            randArr.splice(randInt, 0, i)
        }
    }
    // Отрезок времени необходимый для отрисовки всех карточек
    let timeout = (Number(cols) + Number(rows))*100
    // Отрезок времени с учётом промежутка между анимациями
    let colorTimeout = 2000
    setTimeout(() => {
        // Скрытие всех карточек для пользователя кроме угловых
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
                // Установка позиций для элементов 
                // из массива со случайными позициями
                cards[i].style.order = randArr.pop()
                // Проверка находится ли элемент на своём месте
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
        // Отображение игрового поля для пользователя
        cards.forEach(el => {
            el.style.opacity = 1
        });
        // Добавление слушателей события клика на элементы игрового поля
        cards.forEach(el => {
            el.addEventListener('click', main)
        });
    }, colorTimeout);
    colorTimeout+=timeout
    setTimeout(() => {
        gameState = 'play'
        cards.forEach(el => {
            el.style.transition = 'all .2s'
            // Добавление слушателя события клика 
            // на кнопку завершения игры
            btnQuit.addEventListener('click', restart) 
        });
    }, colorTimeout);
}

/* Функция которая вызывается при нажатии на карточку с цветом */
function main(event) {
    // Функция будет работать если игра в состоянии "play"
    if(gameState != 'play') {
        return
    }
    // Нажатие на угловой элемент не работает
    if(event.target.classList.contains('blocked')) {
        return
    }
    // Отмена активного состояния у карточки цвета
    if(event.target.classList.contains('active')) {
        event.target.classList.remove('active')
        return
    }
    
    // Поиск активной карточки цвета
    let card1 = document.querySelector('.field__container').querySelector('.active')
    if(!card1) {
        event.target.classList.add('active')
        return
    }
    card1.classList.remove('active')

    // Карточка выбираемая после активной для обмена их позициями 
    let card2 = event.target

    // Создание объектов для выбранных карточек
    let cardObj1 = {
        bg: card1.style.backgroundColor,
        pl: order2place(card1.style.order),
    }
    let cardObj2 = {
        bg: card2.style.backgroundColor,
        pl: order2place(card2.style.order),
    }
    // Проверка находятся ли выбранные карточки на своём месте
    cardObj1.correct = rgb2hex(rgbParse(cardObj1.bg)) == field[cardObj1.pl[0]][cardObj1.pl[1]]
    cardObj2.correct = rgb2hex(rgbParse(cardObj2.bg)) == field[cardObj2.pl[0]][cardObj2.pl[1]]
    // Проверка будут ли выбранные карточки находится на своём месте после перемещения
    cardObj1.willCorrect = rgb2hex(rgbParse(cardObj1.bg)) == field[cardObj2.pl[0]][cardObj2.pl[1]]
    cardObj2.willCorrect = rgb2hex(rgbParse(cardObj2.bg)) == field[cardObj1.pl[0]][cardObj1.pl[1]]
    // Подсчёт количества карточек находящихся на своём месте
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
    // Обмен позиций выбранных карточек 
    card2.style.backgroundColor = cardObj1.bg
    card1.style.backgroundColor = cardObj2.bg
    // Увеличение количества шагов
    steps++
    stepsOutput.innerHTML = steps
    // Игра заканчивается если количество карточек на своих местах
    // будет равно общему количеству карточек
    if (correctCards == cols*rows) {
        gameState = win
        win()
    }
}

/* Функция вызывающаяся при победе пользователя */
function win() {
    winSection.classList.add('active')
    setTimeout(() => {
        winSection.classList.remove('active')
    }, 3000);
}