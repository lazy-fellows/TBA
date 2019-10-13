import { Request, Response } from 'express';
import request = require('request'); // "Request" library
import querystring = require('querystring');

/**
 * Controller for managing user authentication.
 */
class AuthController {
    
    client_id = '4a41cf5e745842bcbf538efe856ec067'; // Your client id
    client_secret = '58f5fb6bc74c40f7ba598fa9f2b22dcb'; // Your secret
    redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri
    stateKey = 'spotify_auth_state';

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    private generateRandomString = (length) => {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    public userLogin = (req: Request, res: Response) => {
        
        try{
            var state = this.generateRandomString(16);
            res.cookie(this.stateKey, state);
            // your application requests authorization
            var scope = 'user-read-private user-read-email playlist-read-private';
            res.redirect('https://accounts.spotify.com/authorize?' +
                querystring.stringify({
                    response_type: 'code',
                    client_id: this.client_id,
                    scope: scope,
                    redirect_uri: this.redirect_uri,
                    state: state
                }));
        }
        catch (error) {
            res.status(500).json({error: "Unable to login"});
        }
    };

    public userCallback = (req: Request, res: Response) => {
        try {
            // your application requests refresh and access tokens
            // after checking the state parameter

            var code = req.query.code || null;
            var state = req.query.state || null;
            var storedState = req.cookies ? req.cookies[this.stateKey] : null;
            
            if (state === null || state !== storedState) {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'state_mismatch'
                    }));
            } else {
                res.clearCookie(this.stateKey);
                var authOptions = {
                    url: 'https://accounts.spotify.com/api/token',
                    form: {
                        code: code,
                        redirect_uri: this.redirect_uri,
                        grant_type: 'authorization_code'
                    },
                    headers: {
                        'Authorization': 'Basic ' + Buffer.from(this.client_id + ':' + this.client_secret).toString('base64')
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
        } catch (error) {
            res.status(500).json({error: "Unable to callback"});
        }
    };
};

export { AuthController };
