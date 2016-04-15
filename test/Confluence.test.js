/*jshint -W030 */

var sinon = require('sinon'),
    mockery = require('mockery'),
    expect = require('chai').expect,
    should = require('chai').should();

describe('Confluence', function() {

    describe('constructor', function () {
        it('should return a object has getContent function', function (done) {
            var options = {
                "username": 'test',
                "password": 'test'
            };
            Confluence = require('../lib/Confluence');
            var confluence = Confluence(options);
            confluence.getContent.should.be.defined;
            done();
        });
    });

    describe('getContent', function () {
        var Confluence, requestStub;
        before(function (done) {
                mockery.enable({
                       warnOnReplace: false,
                       warnOnUnregistered: false,
                       useCleanCache: true
                });
                requestStub = sinon.stub();
                mockery.registerMock('request', requestStub);
                Confluence = require('../lib/Confluence');
                done();
        });

        after(function (done) {
                mockery.disable();
                done();
        });

        it('should call helper to build url', function (done) {
            requestStub.yields(null, {statusCode: 200}, {});
            var options = {
                "username": 'test',
                "password": 'test'
            };

            var helper = require('../lib/helper');
            var spy = sinon.spy(helper, 'buildURL');
            var Confluence = require('../lib/Confluence');
            var confluence = Confluence(options);
            var params = {
                'title': 'test'
            };
            confluence.getContent(params).then(function() {
                expect(spy.called).to.be.true;
                expect(spy.calledWith({
                    title: params.title
                })).to.be.true;
                done();
            });
        });

        it('should call with true url format and authentication information', function (done) {
            requestStub.yields(null, {statusCode: 200}, {});
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            var title = 'test';
            var expand = 'body.view,history,children,ancestors,descendants';
            var params = {
                "title": title,
                "expand": expand
            };
            confluence.getContent(params).then(function() {
                requestStub.calledWithMatch({
                    'method': 'GET',
                    'url': 'http://confluence.niometrics.com/rest/api/content?title=test&expand=body.view,history,children,ancestors,descendants',
                    'auth': {
                        'user': options.username,
                        'password': options.password
                    }
                }).should.be.equal(true);
                done();
            });
        });

        it('should return result when respond status code is 200', function (done) {
            requestStub.yields(null, {statusCode: 200}, {'body': 'hi'});
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var params = {
                "title": 'title'
            };
            var confluence = Confluence(options);
            confluence.getContent(params).then(function(result) {
                result.should.be.defined;
                result.body.should.equal('hi');
                done();
            });
        });

        it('should return error when error is defined', function (done) {
            requestStub.yields({message: 'error'}, {statusCode: 200}, null);
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            var params = {
                "title": 'test'
            };
            confluence.getContent(params).then(function(result) {
                result.should.be.undefined;
                done();
            }, function(err){
                err.should.be.defined;
                err.message.should.equal('error');
                done();
            });
        });

        it('should parse json if body is string', function(done) {
            requestStub.yields(null, {statusCode: 200}, '{"body": "hi"}');
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            var params = {
                "title": 'test'
            };
            confluence.getContent(params).then(function(result) {
                Object.prototype.toString.call(result).should.equal('[object Object]');
                done();
            });
        });

        it('should call getResult function if body is json format', function (done) {
            var response = {
                results: [
                {
                    id: "21430351",
                    type: "page",
                    status: "current",
                    title: "Nio Web Platform Home",
                    children: {
                        page: {
                            results: []
                        }
                    }
                }]
            };
            requestStub.yields(null, {statusCode: 200}, response);
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            spy = sinon.spy(confluence, 'getResult');
            var params = {
                "title": 'test'
            };
            confluence.getContent(params).then(function(result) {
                spy.called.should.be.true;
                spy.calledWith(result).should.be.true;
                done();
            });
        });

        it('should call haveChildContent function if response has children', function (done) {
            var response = {
                results: [
                {
                    id: "21430351",
                    type: "page",
                    status: "current",
                    title: "Nio Web Platform Home",
                    children: {
                        page: {
                            results: []
                        }
                    }
                }]
            };
            requestStub.yields(null, {statusCode: 200}, response);
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            spy = sinon.spy(confluence, 'haveChildContent');
            var params = {
                "title": 'test'
            };
            confluence.getContent(params).then(function(result) {
                spy.called.should.be.true;
                done();
            });
        });

        it('should call getChildrentsContent function if response has children', function (done) {
            var response = {
                results: [
                {
                    id: "21430351",
                    type: "page",
                    status: "current",
                    title: "Nio Web Platform Home",
                    children: {
                        page: {
                            results: [{
                                id: '123'
                            }]
                        }
                    }
                }]
            };
            requestStub.yields(null, {statusCode: 200}, response);
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            spy = sinon.spy(confluence, 'getChildrentsContent');
            var params = {
                "title": 'test'
            };
            confluence.getContent(params).then(function(result) {
                spy.called.should.be.true;
                spy.calledWithMatch([{
                    id: '123'
                }]);
                done();
            });
        });

        it('should return error if body is not json format', function (done) {
            requestStub.yields(null, {statusCode: 200}, '"body": "hi"');
            var options = {
                "username": 'test',
                "password": 'test'
            };
            var confluence = Confluence(options);
            var params = {
                "title": 'test'
            };
            confluence.getContent(params).then(function(result) {
                // done();
            }, function(err){
                err.should.be.defined;
                done();
            });
        });

    });

    describe('haveChildContent', function () {

        it('should return false if there is not any childs', function() {
            var parent = {
                children: {
                    page: {
                        results: []
                    }
                }
            };
            var confluence = require('../lib/Confluence')();
            confluence.haveChildContent(parent).should.be.false;
        });

        it('should return true if there is at least one child', function() {
            var parent = {
                children: {
                    page: {
                        results: [{}]
                    }
                }
            };
            var confluence = require('../lib/Confluence')();
            confluence.haveChildContent(parent).should.be.true;
        });

    });

    describe('getResult', function () {

        it('should return null if respond object is null or undefined', function () {
            var confluence = require('../lib/Confluence')();
            expect(confluence.getResult()).equal(null);
        });

        it('should return result if respond object is defined', function() {
            var confluence = require('../lib/Confluence')();
            confluence.getResult({
                results: [{}]
            }).should.be.defined;
        });

        it('should return null if respond object does not have any result', function () {
            var confluence = require('../lib/Confluence')();
            expect(confluence.getResult()).equal(null);
        });

        it('should return null if respond object doest not have result property', function() {
            var confluence = require('../lib/Confluence')();
            expect(confluence.getResult({
            })).equal(null);
        })

    });

    describe('getChildrensContent', function () {

        it('should return array of getContent function by page id and childrent option in expand', function () {
            var childrens = [{
                id: "26902564"
            }];
            var confluence = require('../lib/Confluence')();
            var spy = sinon.spy(confluence, "getContent");
            var processes = confluence.getChildrentsContent(childrens);
            processes.length.should.equal(1);
        });

    });
});

