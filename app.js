const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./fir-node-js-7f5e0-firebase-adminsdk-g1ihl-1082eeb6e0.json')

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", function (req, res) {
    res.render("primeira_pagina")
})

app.get("/consulta", async function (req, res) {
    const dataSnapshot = await db.collection('agendamentos').get();
    const data = [];
    dataSnapshot.forEach((doc) => {
        data.push({
            id: doc.id,
            nome: doc.get('nome'),
            telefone: doc.get('telefone'),
            origem: doc.get('origem'),
            data_contato: doc.get('data_contato'),
            observacao: doc.get('observacao'),
        });
    });
    res.render("consulta", { data });
})



app.get("/excluir/:id", async function (req, res) {
    try {
        await db.collection('agendamentos').doc(req.params.id).delete();
        console.log('Documento excluído com sucesso!');
        res.redirect('/consulta');
    } catch (error) {
        console.error("Error deleting document: ", error);
        res.status(500).send("Erro ao excluir documento");
    }
});

app.post("/cadastrar", function (req, res) {
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function () {
        console.log('Adicionado com sucesso');
        res.send('Success'); // Envia uma resposta simples
    }).catch(function (error) {
        res.status(500).send('Erro ao adicionar agendamento: ' + error);
    });
});
app.get("/editar/:id", async function (req, res) {
    try {
        const docRef = db.collection('agendamentos').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            console.log('No such document!');
            res.status(404).send("Documento não encontrado");
        } else {
            res.render("editar_pagina", { id: req.params.id, agendamento: doc.data() });
        }
    } catch (error) {
        console.error("Error getting document: ", error);
        res.status(500).send("Erro ao buscar documento");
    }
});

app.post("/atualizar/:id", async function (req, res) {
    try {
        const docRef = db.collection('agendamentos').doc(req.params.id);
        await docRef.update({
            nome: req.body.nome,
            telefone: req.body.telefone,
            origem: req.body.origem,
            data_contato: req.body.data_contato,
            observacao: req.body.observacao
        });
        console.log('Documento atualizado com sucesso!');
        res.redirect('/consulta');
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).send("Erro ao atualizar documento");
    }
});

app.listen(8081, function () {
    console.log("Servidor ativo!")
})