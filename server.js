const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Friend = require('./Friends/FriendModel');

const server = express();

server.use(helmet());
server.use(cors());
server.use(bodyParser.json());

server.post('/api/friends', (req, res) => {
	const friendInfo = req.body;
	const { firstName, lastName, age } = friendInfo;

	if (age < 1 || age > 120) {
		res
			.status(400)
			.json({ errorMessage: "Age must be a whole number between 1 and 120" });
	} else if (!firstName || !lastName || !age) {
		res
			.status(400)
			.json({ errorMessage: "Please provide firstName, lastName and age for the friend." });
		} else {
			const friend = new Friend(friendInfo);
			friend
				.save()
				.then((savedFriend) => {
					res.status(201).json(savedFriend);
				})
				.catch((err) => {
					res
						.status(500)
						.json({ error: "There was an error while saving the friend to the database" });
				});
		}
});

server.get('/api/friends', (req, res) => {
	Friend
		.find()
		.then((friends) => {
			res
				.status(200)
				.json(friends);
		})
		.catch((err) => {
			res
				.status(500)
				.json({ error: 'The information could not be retreived.' })
		});
})

server.get('/api/friends/:id', (req, res) => {
	const { id } = req.params;
	Friend
		.findById(id)
		.then((friend) => {
			if (friend) {
				res.status(200).json(friend);
			} else {
				res.status(404).json({ message: "The friend with the specified ID does not exist." });
			}
		})
		.catch((err) => {
			res
				.status(500)
				.json({ error: "The information could not be retrieved." })
		});
})

server.delete('/api/friends/:id', (req, res) => {
	const { id } = req.params;
	Friend.findByIdAndRemove(id)
		.then((removedFriend) => {
			if (removedFriend) {
				res.status(200).json(removedFriend);
			} else {
				res.status(404).json({ message: "The friend with the specified ID does not exist." });
			}
		})
		.catch((err) => {
			res.status(500).json({ error: "The friend could not be removed" });
		});
})

server.put('/api/friends/:id', (req, res) => {
	const { id } = req.params;
	const { firstName, lastName, age } = req.body;

	if (age < 1 || age > 120) {
		res
			.status(400)
			.json({ errorMessage: "Age must be a whole number between 1 and 120" });
	} else if (!firstName || !lastName || !age) {
		res
			.status(400)
			.json({ errorMessage: "Please provide firstName, lastName and age for the friend." });
	} else {
		Friend.findByIdAndUpdate(id, req.body)
			.then((updatedFriend) => {
				if (updatedFriend) {
					res.status(200).json(updatedFriend);
				} else {
					res.status(404).json({ message: "The friend with the specified ID does not exist." });
				}
			})
			.catch((err) => {
				res
					.status(500)
					.json({ error: "There was an error while updating the friend to the database" });
			});
	}
})

mongoose.connect('mongodb://localhost/FriendList')
	.then((db) => {
		console.log(`Successfully Connected to ${db.connections[0].name} Database.`)
	})
	.catch((err) => {
		console.log(`Database Connection Failed: ${err}`);
	});

const port = process.env.PORT || 5005;
server.listen(port, () => {
	console.log(`Api running on http://localhost:${port}.`);
});

