// base 64 encoding
global.Buffer = require('buffer').Buffer;
global.btoa = function (str) { return new Buffer(str).toString('base64'); };

const CDP = require('chrome-remote-interface');

// create basic auth info here
const userName = "userName";
const password = "password";
const url = "https://myurlthatrequiresauth/";
const authHeader = btoa(userName + ':' + password);

console.log('Header: ' + authHeader);

CDP((client) => {
    // extract domains
    const { Network, Page } = client;

    // add basic auth info
    Network.setExtraHTTPHeaders({ 'headers': { 'Authorization': 'Basic ' + authHeader } });

    // enable events then start!
    Promise.all([
        Network.enable(),
        Page.enable()
    ]).then(() => {
        let res = Page.navigate({ url: url }, () => {
            setTimeout(() => {
                // be done
                console.log('shutting down');
                client.close();
            }, 3000);
        });
        return res;
    }).catch((err) => {
        console.error(err);
        client.close();
    });
}).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error('PROBLEM!');
    console.error(err);
});
