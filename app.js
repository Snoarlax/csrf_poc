const express = require('express');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const user_router = express.Router();
const app = express();
const PORT = 1337;
  
app.use(body_parser.json());
app.use(cookie_parser());
app.use('/user', user_router);
const users = {};

function authenticate(req, res, next){
	const name = req.cookies['username'];
	const password = req.cookies['password'];


	if (users[name].hasOwnProperty('password') && !(password == users[name]['password'])){
		throw new Error(`Invalid password for ${name}! Submitted ${password}`);
	}

	next();
}

user_router.use(authenticate);

// Authenticated
// Vulnerable to CSRF -> We shouldn't use GET for this!
user_router.get('/:name/:item', (req, res)=>{
	const item = req.params.item;
	const name = req.params.name;
	console.log(`AddItem: ${item} in ${name}`);
	if (!users.hasOwnProperty(name)){
		users[name] = {};
	}
    if(!users[name].hasOwnProperty('cart')){
		users[name]['cart'] = []
	}
	users[name]['cart'].push(item);

	console.log(`${name} cart: ` + users[name]['cart'].toString());
    res.send(`Added ${item} to ${name}\'s cart`);
});


user_router.get('/:name', (req, res) => {
	const name = req.params.name;
	console.log(`GetCart: ${name}`);
	if (users.hasOwnProperty(name) && users[name].hasOwnProperty('cart')){
		res.send(users[name]['cart']);
	}
	else {
		res.send("");
	}

	console.log(`returned cart for ${name}`);
});


// Unauthenticated
app.post('/:name', (req, res) => {
	const {password} = req.body;
	const name = req.params.name;
	console.log(`UpdatePassword: ${password} in ${name}`);
	if (!users.hasOwnProperty(name)){
		users[name] = {};
	}
	users[name]['password'] = password;
	// TODO: set scope to only the /name/* scope
	res.cookie('username', name);
	res.cookie('password', password);
	res.send(`Set the password of ${name} to ${password}`);
});	

app.get('/users', (req, res) => {
	res.send(users);
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
