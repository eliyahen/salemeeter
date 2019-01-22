const initialize = require('./initialize');

initialize().then(() => {
    const app = require('./app');

    const server = app.listen(process.env.APP_PORT, function () {
        const host = server.address().address;
        const port = server.address().port;
    
        console.log('Welcome to Semel customers management system!');
        console.log('Server application listening at http://%s:%s', host, port);
    });
}, () => {
    console.error('FAILURE: Could not initialize server!');
});
