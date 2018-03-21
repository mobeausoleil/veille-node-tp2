'use strict';

const tab = require("./tableaux.js");
const maxNom = tab.tableaux.tabNom.length;
const maxPrenom = tab.tableaux.tabPrenom.length;
const maxDom = tab.tableaux.tabDomaine.length;

const peupler = () => {
	//nom
	let pos = Math.floor(Math.random()*maxNom);
	let nom = tab.tableaux.tabNom[pos];

	//prenom
	pos = Math.floor(Math.random()*maxPrenom);
	let prenom = tab.tableaux.tabPrenom[pos];

	//telephone
	let telephone = "514-";
	for (let i=0; i<7; i++){
		let chiffre = Math.floor(Math.random()*9);
		telephone = telephone+chiffre;
	}

	//couriel
	pos = Math.floor(Math.random()*maxDom);
	let courriel = prenom.toLowerCase() + "@"+tab.tableaux.tabDomaine[pos];

	return {
		nom: nom,
		prenom: prenom,
		telephone: telephone,
		courriel: courriel
	}
}

module.exports = peupler;