const express = require('express');
const { URL, URLSearchParams } = require('url');
const axios = require('axios');
const bcrypt = require('bcrypt');
const asyncErrorHandler = require('./helpers/error.decorator').asyncErrorHandler;

const router = express.Router({strict: true});

router.get('/login', (req, res) => {
    const { complete } = req.query;  // redirect to this url when login process is complete with the appropriate result of the login
    if (!complete) {
        res.status(400).json({
            error: '"complete" url must be supplied!',
        });
        return;
    }
    const redirectSearchParams = new URLSearchParams({ complete });
    const authorizeUrlParams = new URLSearchParams({
        client_id: process.env.AUTH0_CLIENT_ID,
        redirect_uri: `${req.protocol}://${req.hostname}:${process.env.APP_PORT}${req.baseUrl}/authenticated?${String(redirectSearchParams)}`,
        response_type: 'code',
        scope: 'openid profile email phone',
        state: bcrypt.hashSync(String(Date.now()), 5),
    });
    const authorizeUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize?${String(authorizeUrlParams)}`);
    res.redirect(authorizeUrl);
});

router.get('/authenticated', asyncErrorHandler(async (req, res) => {
    const { complete, code, state } = req.query;
    if (!complete) {
        res.status(400).json({
            error: '"complete" url must be supplied!',
        });
        return;
    }
    if (code) {
        axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            redirect_uri: `${req.protocol}://${req.hostname}:${process.env.APP_PORT}${req.baseUrl}${req.path}`,
            state,
            code,
        }).then((resp) => {
            data = resp.data;
            const completeUrl = new URL(complete);
            completeUrl.searchParams.set('status', 'success');
            completeUrl.searchParams.set('jwToken', data.id_token);
            completeUrl.searchParams.set('type', data.token_type);
            completeUrl.searchParams.set('expire', data.expires_in);
            res.redirect(String(completeUrl));
            
            // res.status(200).json({
            //     tokenType: data.token_type,
            //     token: data.access_token,
            //     jwToken: data.id_token,
            //     expireTime: data.expires_in, 
            //     redirectTo: complete,
            // });
        }, (err) => {
            const completeUrl = new URL(complete);
            completeUrl.searchParams.set('status', 'failure');
            completeUrl.searchParams.set('error', 'Failed to get token.');
            completeUrl.searchParams.set('code', err.response.data.error);
            completeUrl.searchParams.set('message', err.message);
            res.redirect(String(completeUrl));
            // res.status(401).json({
            //     error: 'Failed to get token.',
            //     status: err.response.status,
            //     code: err.response.data.error,
            //     message: err.message,
            // });
        });
    } else {
        res.sendStatus(401);
    }
}));

router.get('/logout', (req, res) => {
    const { complete } = req.query;  // redirect to this url when login process is complete with the appropriate result of the login
    if (!complete) {
        res.status(400).json({
            error: '"complete" url must be supplied!',
        });
        return;
    }
    const redirectSearchParams = new URLSearchParams({ complete });
    const logoutUrlParams = new URLSearchParams({
        client_id: process.env.AUTH0_CLIENT_ID,
        returnTo: `${req.protocol}://${req.hostname}:${process.env.APP_PORT}${req.baseUrl}/disconnected?${String(redirectSearchParams)}`,
    });
    const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout?${String(logoutUrlParams)}`);
    res.redirect(logoutUrl);
});

router.get('/disconnected', (req, res) => {
    const { complete, code, state } = req.query;
    if (!complete) {
        res.status(400).json({
            error: '"complete" url must be supplied!',
        });
        return;
    }
    // do disconnect stuff here
    const completeUrl = new URL(complete);
    res.redirect(completeUrl);
});

router.get('/userinfo', (req, res) => {
    axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
            Authorization: `${data.token_type} ${data.access_token}`,
        },
    }).then((userInfo) => {
        res.status(200).json(userInfo.data);
    }, (error) => {
        res.status(error.status).json(error.data);
    });
});

module.exports = router;
