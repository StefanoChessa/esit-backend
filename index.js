const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const rp = require('request-promise');
const appid = '<APP ID>';
const port = 8000;
const mongoose = require('mongoose');

const weatherSchema = mongoose.model('weatherSchema', new mongoose.Schema({
    "location": String,
    "temp": Number,
    "humidity": Number,
    "wind": Number,
    "pressure": Number,
    "last_update": Number
}));

app.listen(port, () => {
    console.log('Listening on port ' + port);
});

mongoose.connect("mongodb://localhost:27017/mongoWeather", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Engine connected successfully to the mongo database'))
    .catch((err) => console.error(err));

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
        res.send(processData(body));
    }).catch(err => {
        res.send(err);
    });
});

/*Implementazione di un secondo endpoint di tipo GET che restituisca a video (su browser o postman) il meteo attuale
in una località predefinita passata parametro della chiamata. Es: http://localhost:8000/meteo/assemini*/
app.get('/meteo/:location', (req, res) => {
    rp('https://api.openweathermap.org/data/2.5/weather?q=' + req.params.location + '&appid=' + appid,
        {json: true}).then(body => {
        console.log(processData(body));
        res.send(processData(body));
    }).catch(err => {
        res.send(err);
    });
});

app.get('/mongo/:location', async (req, res) => {

    const location = req.params.location;
    const update_time = 900000;
    const currentTime = Date.now();
    const weather = await weatherSchema.findOne({location: req.params.location});

    if (weather == null) {
        let doc = new weatherSchema;
        rp('https://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=' + appid,
            {json: true}).then(body => {
            console.log("Creo il nuovo documento");
            const result = processData(body);
            doc.location = location;
            doc.temp = result.temp;
            doc.humidity = result.humidity;
            doc.wind = result.wind;
            doc.pressure = result.pressure;
            doc.last_update = currentTime;
            doc.save().then(res.send({
                "location": location,
                "temp": result.temp,
                "humidity": result.humidity,
                "wind": result.wind,
                "pressure": result.pressure,
                "last_update": currentTime
            }));
        }).catch(err => {
            res.send(err);
        });
    } else if ((currentTime - weather.last_update) < update_time) {
        console.log("Leggo il documento da mongo");
        res.send({
            "location": weather.location,
            "temp": weather.temp,
            "humidity": weather.humidity,
            "wind": weather.wind,
            "pressure": weather.pressure,
            "last_update": weather.last_update
        });
    } else {
        rp('https://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=' + appid,
            {json: true}).then(body => {
            console.log("Aggiorno il documento");
            const result = processData(body);
            weather.temp = result.temp;
            weather.humidity = result.humidity;
            weather.wind = result.wind;
            weather.pressure = result.pressure;
            weather.last_update = currentTime;
            weather.save().then(
                res.send({
                "location": location,
                "temp": result.temp,
                "humidity": result.humidity,
                "wind": result.wind,
                "pressure": result.pressure,
                "last_update": currentTime
            }));
        });
    }
});


/*METODI DI SUPPORTO*/
function processData(body) {
    let result = {
        "location": body.name,
        "temp": parseFloat((body.main.temp - 273.15).toFixed(1)),
        "humidity": body.main.humidity,
        "wind": body.wind.speed,
        "pressure": body.main.pressure,
    };
    return result;
}

