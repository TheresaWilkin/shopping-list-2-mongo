//imports

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();

var Item = require('./models/item');

//middleware

app.use(bodyParser.json());
app.use(express.static('public'));

//routes

app.get('/items', function(request, response) {
	Item.find(function(err, items) {
		if (err) {
			return response.status(500).json({
				message: 'Internal Server Error'
			});
		}
		response.status(200).json(items);
	});
});

app.post('/items', function(request, response) {
	var newItem = {
		name: request.body.name
	};
	
	Item.create(newItem, function(err, item) {
		if (err) {
			return response.status(500).json({
				message: 'Internal Server Error'
			});
		}
		response.status(201).json(item);
	});
});

app.put('/items/:id', function(request, response) {
	var id = request.params.id;
	var name = request.body.name;
	if (!name) {
		return response.status(500).json({
			message: 'Internal Server Error'
		});
	}
	Item.findOneAndUpdate({_id: id}, {name: name}, function(err, results) {
		if (err) {
			return response.status(500).json({
				message: 'Internal Server Error'
			});
		}
		response.status(200).json(results);
	});
});
app.delete('/items/:id', function(request, response) {
	var id = request.params.id;
	Item.findOneAndRemove({_id: id}, function(err, results) {
		if (err) {
			return response.status(500).json({
				message: 'Internal Server Error'
			});
		}
		response.status(200).json(results);
	});
});


app.use('*', function(request, response) {
	response.status(404).json({
		message: 'Not Found'
	});
});

//server and database connection

var runServer = function(callback) {
	mongoose.connect(config.DATABASE_URL, function(err) {
		if (err && callback) {
			return callback(err);
		}

		app.listen(config.PORT, function() {
			console.log('Listening on localhost' + config.PORT);
			if (callback) {
				callback();
			}
		});
	});
};

if (require.main === module) {
	runServer(function(err) {
		if(err) {
			console.error(err);
		}
	});
};

exports.app = app;
exports.runServer = runServer;