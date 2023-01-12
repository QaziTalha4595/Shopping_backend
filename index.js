const express = require('express');
const bodyparser = require('body-parser');
const api = require('./src/api');

const app = express();
const PORT = 3000;


app.use(bodyparser.urlencoded({ extended: false }))

app.use(bodyparser.json())
app.use('/api/v1/', api);

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
