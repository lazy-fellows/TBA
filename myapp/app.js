var express = require('express');
var request = require('request'); // "Request" library
var cors = require('cors');
var cookieParser = require('cookie-parser');


var app = express();

app.use(express.static(__dirname + '/public')).use(cors()).use(cookieParser());

var querystring = require('querystring');

var client_id = '4a41cf5e745842bcbf538efe856ec067'; // Your client id
var client_secret = '58f5fb6bc74c40f7ba598fa9f2b22dcb'; // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

var stateKey = 'spotify_auth_state';

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};


app.get('/', function (req, res) {
    console.log('hereeee');
  res.send('Hello World!');
});

app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    console.log(state.slice(0, 5));
    // your application requests authorization
    var scope = 'user-read-private user-read-email playlist-read-private';
    console.log('before redirect');
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function (req, res) {
    console.log("In Callback");
    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    console.log(req.cookies[stateKey].slice(0, 5));
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    
    console.log(state === null);
    console.log(state === storedState);
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64')
            },
            json: true
        };
        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function (error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });      
    }
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
