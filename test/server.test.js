const assert = require('assert');
const sinon = require('sinon'); // Import sinon for mocking
const proxyquire = require('proxyquire');

describe('Server', function () {
    let server;

    beforeEach(function () {
        // Mock the HTTP module
        const httpMock = {
            createServer: sinon.stub().returns({
                listen: sinon.stub(),
            }),
        };

        // Replace the HTTP module with the mock
        server = proxyquire('../scripts/server', {
            http: httpMock,
        });
    });

    it('should create an HTTP server', function () {
        assert(server, 'Server was not created');
    });
});