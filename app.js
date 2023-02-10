const express = require('express');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const admin_router = express.Router();
const app = express();
const PORT = 1337;
const default_password = 'CSRF_IS_COOL';
  
app.use(body_parser.json());
app.use(cookie_parser());
app.use('/auth', admin_router);
const db =  { 'cart' : [], 'password' : default_password, 'balance' : 100};

function authenticate(req, res, next){
	const password = req.cookies['password'];

	if (db.hasOwnProperty('password') && !(password == db['password'])){
		throw new Error(`Invalid password! Submitted ${password}`);
	}

	next();
}

// Not important for PoC, this is just for randomly getting a price from an item
function cost(item){
	// counts number of 1's in binary representation of item, then tries to normalise 
	var sum = 0;
	for (let i = 0; i < item.length; i++) {
		sum += item[i].charCodeAt().toString(2).split('1').length/4;
	}

	return sum % 10;
}

admin_router.use(authenticate);

// Authenticated

// Vulnerable to CSRF -> We shouldn't use GET for this!
admin_router.get('/:item', (req, res)=>{
	const item = req.params.item;
	console.log(`AddItem: ${item}`);
    if(!db.hasOwnProperty('cart')){
		db['cart'] = [];
	}
	db['cart'].push(item);

	console.log(`cart: ` + db['cart'].toString());
    res.send(`Added ${item} to cart\n`);
});


admin_router.get('/', (req, res) => {
	console.log(`GetCart`);
	res.send(db['cart']);
});


admin_router.post('/purchase', (req, res) => {
	var total = 0;
	for (let i = 0; i < db['cart'].length; i++) {
		total += cost(db['cart'][i]);
	}

	console.log(`Purchased: ${db['cart']}`);
	db['cart'] = [];
	db['balance'] = db['balance'] - total;

	res.send(`Total cost: £${total}\n`);
});

admin_router.post('/update_password', (req, res) => {
	const {password} = req.body;
	console.log(`UpdatePassword: ${password}`);
	db['password'] = password;
	res.cookie('password', password);
	res.send(`Set the password to ${password}\n`);
});	

// Not authenticated
// Debugging
app.get('/db', (req, res) => {
	res.send(db);
});


app.get('/get_password', (req, res) => {
	let password = db['password'];
	console.log(`GetPassword: ${password}`);
	res.cookie('password', password);
	res.send(`Returned password, ${password}\n`);
});	

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
