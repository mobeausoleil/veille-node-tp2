'use strict';
/////////////////////////////////////////////////Require
const express = require('express');
const app = express();
const server = require('http').createServer(app);
var io = require('./mes_modules/chat_socket').listen(server);
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;
app.use(bodyParser.urlencoded({extended: true}));
const peupler = require("./mes_modules/peupler");
const util = require("util");
const i18n = require("i18n");
const cookieParser = require('cookie-parser');

/* on associe le moteur de vue au module «ejs» */
app.set('view engine', 'ejs'); // générateur de template

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());

i18n.configure({ 
   locales : ['fr', 'en'],
   cookie : 'langueChoisie', 
   directory : __dirname + '/locales' });

app.use(i18n.init);

//Connexion à mongoDB et au serveur Node.Js
let db; // variable qui contiendra le lien sur la BD
MongoClient.connect('mongodb://127.0.0.1:27017/carnet_adresses', (err, database) => {
 if (err) return console.log(err);
 db = database.db('carnet_adresses');

// lancement du serveur Express sur le port 8081
 server.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081');
 });
});

///////////////////////////////////////////////////////////////////////////Routes

/////////////////////////////////////////////////////Internationalisation

app.get('/:locale(en|fr)', (req, res)=>{

	if(req.params.locale == "en"){
		req.params.locale = "fr";
	} else {
		req.params.locale = "en";
	}

	res.cookie('langueChoisie' , req.params.locale);
	res.setLocale(req.params.locale);

	res.render('accueil.ejs');
	//req.originalUrl();
})

////////////////////////////////////////////////////accueil
app.get('/', (req, res) => {
	let cursor = db.collection('adresses').find().toArray((err, resultat) => {
 		if (err) return console.log(err);
 		if(res.getLocale() == null){req.params.locale = "en"}
 		console.log(req.cookies.langueChoisie);
 		res.render('accueil.ejs', {adresses: resultat, direction: "asc"});
 	});
});

////////////////////////////////////////////////////Liste des membres
app.get('/membres', (req, res) => {
	let cursor = db.collection('adresses').find().toArray((err, resultat) => {
 		if (err) return console.log(err);
  		res.render('gabarit.ejs', {adresses: resultat, direction: "asc"});
  	});
});

////////////////////////////////////////////////////Page de recherche
app.get('/profil', (req, res) => {
	let cursor = db.collection('adresses').find().toArray((err, resultat) => {
 		if (err) return console.log(err);
  		res.render('profil.ejs', {adresses: resultat, direction: "asc", membre: undefined});
  	});
});

/////////////////////////////////////////////////////ajouter
app.post('/ajouter', (req, res) => {
	db.collection('adresses').save(req.body, (err, result) => {
		if (err) return console.log(err);
		console.log(req.body);
		console.log('sauvegarder dans la BD');
		res.send(JSON.stringify(req.body));
	});
});

/////////////////////////////////////////////////////detruire
app.get('/detruire/:id', (req, res) => {
	console.log("detruire");
	let critere = ObjectID(req.params.id);
	console.log(critere);
	db.collection('adresses').findOneAndDelete({"_id": critere}, (err, resultat) => {
		if (err) return console.log(err);
		res.send(JSON.stringify(req.body));
	});
});

/////////////////////////////////////////////////////modifier
app.post('/modifier', (req, res) => {
	req.body._id = ObjectID(req.body._id);
	db.collection('adresses').save(req.body, (err, result) => {
		if (err) return console.log(err);
		console.log('sauvegarder dans la BD');
		res.send(JSON.stringify(req.body));
	});
});

///////////////////////////////////////////////////Trier
app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle;
	let ordre = (req.params.ordre == 'asc' ? 1 : -1);
	let cursor = db.collection('adresses').find().sort(cle,ordre).toArray((err, resultat)=>{
		ordre *= -1;
		let direction = (ordre == 1 ? "asc" : "desc");
		res.render('gabarit.ejs', {
			adresses: resultat, cle, direction
		});
	});
});

//////////////////////////////////////////////////Peupler
app.get('/peupler', (req, res) => {
	let peuple = [];

	for(let p=0; p<10; p++){
		let contact = peupler();
		peuple.push(contact);
	}

	console.log(peuple);

	db.collection('adresses').insert(peuple, (err, result) => {
		if (err) return console.log(err);
		console.log('sauvegarder dans la BD');
		res.redirect('/membres');
	});
});

//////////////////////////////////////////////////Vider la liste des membres
app.get('/vider', (req, res) => {

	db.collection('adresses').drop((err, result) => {
		if (err) return console.log(err);
		console.log('Liste de membres vidée');
		res.redirect('/membres');
	});
});

/////////////////////////////////////////////////////Rechercher des membres
app.post('/profil/recherche/', (req, res) => {
	console.log(req.body.recherche);
	let recherche = req.body.recherche;
	let membresChercher = db.collection('adresses')
		.find(
			{$or:
				[
					{"_id": recherche},
					{"nom": recherche},
					{"prenom": recherche},
					{"telephone": recherche},
					{"courriel": recherche},
				]
			}).toArray((err, resultat) => {
				if (err) return console.log(err);
				console.log(resultat);
				res.render('profil.ejs', {membre: resultat});
			});
});

////////////////////////////////////////////////////Profil d'un membre
app.get('/profilmembre/:id', (req, res) => {
	let critere = ObjectID(req.params.id);
	let cursor = db.collection('adresses').find({"_id": critere}).toArray((err, resultat) => {
 		if (err) return console.log(err);
  	res.render('unmembre.ejs', {unmembre: resultat});
  });
});

////////////////////////////////////////////////////Chat
app.get('/clavardage', (req, res) => {
	res.render('socket_chat.ejs');
});