const express = require('express');
const ejs = require('ejs');
const request = require('request');
const path = require('path');
const PORT = process.env.PORT || 5000;
const {VK} = require('vk-io');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const config = require('./config');
const vk = new VK({
    token: config.token
});

let start = parseInt(new Date().getTime() / 1000);
let mur = 0;
let cases = 0;

function loger(log) {
    let d = new Date();
    let time = `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] `;
    console.log(time + log);
}
function pogladit() {
    vk.api.messages.send({
        'peer_id': '-153346724',
        'message': 'Погладить кота'
    });
    mur = mur + 1 * config.cats;
    loger('Котик поглажен.');
    setTimeout(pogladit, config.delay);
}
function friendPoglad(token) {
    let sosed = new VK({
        token: token
    });
    sosed.api.messages.send({
        'peer_id': '-153346724',
        'message': config.ns,
        'payload': `{"button_command": "friend_click ${config.id}"}`
    });
    mur = mur + 0.5 * config.cats;
    loger(`Вашего кота погладил сосед`);
}
function fGlad() {
    config.users.forEach(function (token) {
        friendPoglad(token)
    });
    loger('Все ваши соседи погладили вашего кота. ^_^');
    setTimeout(fGlad, config.delay);
}
function buyCase() {
    vk.api.messages.send({
        'peer_id': '-153346724',
        'message': 'Купить за поглаживания',
        'payload': `{"button_command": "buy clicks case"}`
    });
    mur = mur - 2100;
    cases++;
    loger(`Куплен кейс`);
    setTimeout(buyCase, config.buy);
}
vk.updates.on('message', (context, next) => {
    if (context.senderId !== config.id || !context.hasText) return next();
    switch (context.text.split(" ")[0]) {
        case "стата":
            return context.send(
                `Статистика:\n`+
                `С момента запуска прошло ${parseInt(new Date().getTime() / 1000) - start} секунд.\n`+
                `За это время бабушка погладила кота ${mur} раз.\n`+
                `Куплено кейсов: ${cases}`
            );
            break;
        case "ебал":
            let code = context.text.substr(5);
            try {
                context.send(eval(code));
            } catch (e) {
                context.send(`При выполнении ${code} произошла ошибка:\n` + e);
            }
            break;
        default:
            return next();
    }
});
vk.updates.startPolling().then(() => {
    loger(`Бабушка начала гладить котов.`);
    pogladit();
    fGlad();
    buyCase();
});

vk.updates.start().catch(console.error);


if (config.link !== "") express().use(express.static(path.join(__dirname, 'public'))).set('views', path.join(__dirname, 'views')).set('view engine', 'ejs').get('/', (req, res) => res.render('')).listen(PORT);

rl.on('line', (input) => {
    switch (input.split(" ")[0]) {
        case "стата":
            loger(`Статистика:`);
            loger(`С момента запуска прошло ${parseInt(new Date().getTime() / 1000) - start} секунд.`);
            loger(`За это время бабушка погладила кота ${mur} раз.`);
            break;
        case "ебал":
            let code = input.substr(5);
            try {
                loger(eval(code));
            } catch (e) {
                loger(`При выполнении ${code} произошла ошибка:`);
                loger(e);
            }
            break;
    }
});

if (config.link !== "") setInterval(function () {request(config.link)}, 240000);
