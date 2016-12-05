global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
    beforeEach(function(done) {
        server.runServer(function() {
            Item.create({name: 'Broad beans'},
                {name: 'Tomatoes'},
                {name: 'Peppers'}, function() {
                    done();
                });
        });
    });

    afterEach(function(done) {
        Item.remove(function() {
            done();
        });
    });

    it('should list items on GET', function(done) {
        chai.request(app)
        .get('/items')
        .end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body.should.have.length(3);
            res.body[0].should.be.a('object');
            res.body[0].should.have.property('_id');
            res.body[0].should.have.property('name');
            res.body[0].name.should.be.a('string');
            res.body[0].name.should.equal('Broad beans');
            res.body[1].name.should.equal('Tomatoes');
            res.body[2].name.should.equal('Peppers');
            done();
        });
    });

    it('should add an item on POST', function(done) {
        chai.request(app)
        .post('/items')
        .send({'name': 'Kale'})
        .end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('_id');
            res.body.name.should.be.a('string');
            res.body.name.should.equal('Kale');
        });
        chai.request(app)
        .get('/items')
        .end(function(err, res) {
            res.body.should.be.a('array');
            res.body.should.have.length(4);
            res.body[3].should.be.a('object');
            res.body[3].should.have.property('_id');
            res.body[3].should.have.property('name');
            res.body[3].name.should.be.a('string');
            res.body[3].name.should.equal('Kale');
            done();
        });
    });

    it('should edit an item on put', function(done){
        chai.request(app)
        .get('/items')
        .end(function(err, res) {
            var id = res.body[0]._id;
            chai.request(app)
            .put('/items/' + id)
            .send({'name': 'Pizza'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body.name.should.be.a('string');
                res.body.name.should.equal('Broad beans');
            });
            chai.request(app)
            .get('/items')
            .end(function(err, res) {
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0].name.should.be.a('string');
                res.body[0].name.should.equal('Pizza');
                done();
            });
        });
    });

    it('should delete an item on delete', function(done){
        chai.request(app)
        .get('/items')
        .end(function(err, res) {
            var id = res.body[0]._id;
            chai.request(app)
            .delete('/items/' + id)
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                chai.request(app)
                .get('/items')
                .end(function(err, res) {
                    res.body.should.be.a('array');
                    res.body.should.have.length(2);
                    res.body[0].should.be.a('object');
                    res.body[0].should.have.property('_id');
                    res.body[0].should.have.property('name');
                    res.body[0].name.should.be.a('string');
                    res.body[0].name.should.equal('Tomatoes');
                    done();
                });
            });
        });
    });

    it('should return a 500 when empty body sent for post', function(done){
        chai.request(app)
        .post('/items')
        .send({})
        .end(function(err, res) {
            res.should.have.status(500);
            done();
        });
    });

    it('should return a 500 when empty body sent for put', function(done){
       chai.request(app)
       .get('/items')
       .end(function(err, res) {
        var id = res.body[0]._id;
        chai.request(app)
        .put('/items/' + id)
        .send({})
        .end(function(err, res) {
            res.should.have.status(500);
            done();
        });
    });
   });

});