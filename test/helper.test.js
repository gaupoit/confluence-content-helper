/*jshint -W030 */
var sinon = require('sinon'),
    mockery = require('mockery'),
    expect = require('chai').expect,
    should = require('chai').should(),
    helper = require('../utils/helper'),
    confluenceConfig = require('../config/confluenceConfig');
describe('helper', function() {
    describe('buildConfluenceQuery', function() {
        it('should return empty if input does not have any data', function(done) {
            var input = {};
            var query = helper.buildConfluenceQuery(input);
            query.should.be.equal('');
            done();
        });
        it('should return query having title when input has title data', function(done) {
            var input = {
                title: 'testTitle'
            };
            var query = helper.buildConfluenceQuery(input);
            query.should.be.equal('?title=testTitle');
            done();
        });
        it('should return query having title and expand if input has title and expand', function(done) {
            var input = {
                title: 'testTitle',
                expand: 'body.view'
            };
            var query = helper.buildConfluenceQuery(input);
            query.should.be.equal('?title=testTitle&expand=body.view');
            done();
        });
        it('should return expand if input has expand', function(done) {
            var input = {
                expand: 'body.view'
            };
            var query = helper.buildConfluenceQuery(input);
            query.should.be.equal('?expand=body.view');
            done();
        });
        it('should return series of expand spererating by comma when input has array of expands', function(done) {
            var input = {
                expand: ['body.view', 'version']
            };
            var query = helper.buildConfluenceQuery(input);
            query.should.be.equal('?expand=body.view,version');
            done();
        });
    });
    describe('buildURI', function() {
        it('should return uri including with predefined format /rest/api/content', function() {
            var uri = helper.buildURI();
            var existed = uri.indexOf('/rest/api/content') > -1;
            existed.should.be.true;
        });
        it('should return uri including id\'s value', function() {
            var uri = helper.buildURI({
                id: 1235
            });
            uri.should.equal('/rest/api/content/1235');
        });
        it('should call buildConfluenceQuery function', function(){
            var spy = sinon.spy(helper, "buildConfluenceQuery");
            helper.buildURI();
            expect(spy.called).to.be.true;
        });
        it('should return uri including title\'s value', function () {
            var uri = helper.buildURI({
                title: 'test'
            });
            uri.should.equal('/rest/api/content?title=test');
        });
    });
    describe('buildURL', function() {
        it('should return url including base url', function () {
            var url = helper.buildURL();
            var isIncludedBaseUrl = url.indexOf(confluenceConfig.baseUrl) > -1;
            isIncludedBaseUrl.should.be.true;
        });
        it('should call buildURI function', function () {
            var spy = sinon.spy(helper, 'buildURI');
            var params = {
                title: 'test'
            };
            helper.buildURL(params);
            spy.called.should.be.true;
            spy.calledWith(params).should.be.true;
        });
        it('should return url with page id', function () {
            var params = {
                id: 12345
            };
            var url = helper.buildURL(params);
            url.should.equal("http://confluence.niometrics.com/rest/api/content/12345");
        });
        it('should return url with title and expand value', function () {
           var params = {
                title: 'test',
                expand: 'body.view'
            };
            var url = helper.buildURL(params);
            url.should.equal("http://confluence.niometrics.com/rest/api/content?title=test&expand=body.view");
        });
    });
});
