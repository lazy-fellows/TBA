import colors = require('colors');
import express = require('express');
import cors = require('cors');
import cookieParser = require('cookie-parser');

import { authRouter } from './server/routes/authRoutes';
import { playlistRouter } from './server/routes/playlistRoutes';

var app = express();

app.use(express.static(__dirname + '/public')).use(cors()).use(cookieParser());

// Routes
app.use('/', authRouter)

app.use('/', playlistRouter)

app.listen(3000, () => {
    console.log(colors.green(`App listening on port 3000!`));
});
