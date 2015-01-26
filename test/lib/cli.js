var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    rewire = require('rewire'),
    cli = require('../../lib/cli');

chai.use(sinonChai);

var fakeDocker = { getClient: sinon.stub() },
    fakeExit   = sinon.stub();

describe('CLI', function() {
    beforeEach(function() {
      //  revert = cli.__set__({ docker: fakeDocker});
    });

/*    afterEach(function() {*/
        //revert();
    //});

    //context('when called with default arguments', function() {
        //var endpoint = 'http://127.0.0.1:2375';

        //it('creates a docker client', function() {
            //cli.argv(['node', 'server', '-e', endpoint]);

            //expect(fakeDocker.getClient).to.have.been
                //.calledWith(endpoint, '/home/.docker', 'grounds');
        //});
    //});

    //context('when called with custom arguments', function() {
        //var endpoint = 'http://127.0.0.1:2376',
            //certs = '/test',
            //repo = 'test';

        //it('creates a docker client', function() {
            //cli.argv(['node', 'server', '-e', endpoint,
                                        //'--certs='+certs,
                                        //'--repository='+repo]);

            //expect(fakeDocker.getClient).to.have.been
                //.calledWith(endpoint, certs, repo);
        //});
    //});

    //context('when called with wrong docker endpoint', function() {
        //beforeEach(function() {
  ////          revert();
            //cli.argv(['node', 'server', '-e', 'azerty'], fakeExit);
        //});
        //expectProgramToQuit();
    //});

    //context('when called with wrong certs path', function() {
        //beforeEach(function() {
    ////        revert();
            //cli.argv(['node', 'server', '-e', 'http://127.0.0.1:2376', '--certs=azerty'], fakeExit);
        //});
        //expectProgramToQuit();
    //});

    //context('when called with wrong port number', function() {

    //});

    //function expectProgramToQuit() {
        //it('exit the program', function() {
            //expect(fakeExit).to.have.been.called;
        //});
    /*}*/
});
