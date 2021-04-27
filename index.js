const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const rp = require('request-promise');
const appid = '<APP ID>';
const port = 8000;


app.listen(port, () => {
    console.log('Listening on port ' + port);
});


/*ROUTES*/

app.get('/', (req, res) => res.send('ESIT WEB DEVELOPMENT API'));

/*Implementare un endpoint di tipo GET che restituisca a video (su browser o postman) il meteo attuale in una località
predefinita passata come costante.
Es: meteo attuale a Cagliari.
La struttura deve essere così definita:
{citta, temperatura, umidita, vento, pressione}*/

const city = 'Cagliari';
app.get('/meteo', (req, res) => {
    rp('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + appid, {json: true}).then(body => {
        res.send(dataProcess(body));
    }).catch(err => {
        res.send(err);
    });
});

/*Implementazione di un secondo endpoint di tipo GET che restituisca a video (su browser o postman) il meteo attuale
in una località predefinita passata parametro della chiamata. Es: http://localhost:8000/meteo/assemini*/
app.get('/meteo/:citta', (req, res) => {
    rp('https://api.openweathermap.org/data/2.5/weather?q=' + req.params.citta + '&appid=' + appid,
        { json: true }).then(body => {
            console.log(dataProcess(body));
        res.send(dataProcess(body));
    }).catch(err => {
        res.send(err);
    });
});


/*METODI DI SUPPORTO*/
function dataProcess(body) {
    let result = {
        "citta": body.name,
        "temperatura": (body.main.temp - 273.15).toFixed(2),
        "umidita": body.main.humidity,
        "vento": body.wind.speed,
        "pressione": body.main.pressure,
    };
    return result;
}

