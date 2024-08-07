const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminRoute = express.Router();
adminRoute.use(express.json());
const moment = require("moment");
const fs = require("fs")

require("dotenv").config();

const { AdminModel } = require("../model/AdminModel");


adminRoute.post("/register", async (req, res) => {
    const { name, email, password, role, image } = req.body
    const adminFound = await AdminModel.findOne({ email })
    if (adminFound) {
        res.status(409).send({ "message": "Already admin registered" })
    }
    else {
        try {
            let dateFormat = moment().format('D-MM-YYYY');
            const data = new AdminModel({ name, email, password, image, registeredDate: dateFormat, role })
            await data.save()
            res.status(201).send({ "message": "admin Registered" })
        }
        catch (err) {
            res.status(500).send({ "ERROR": err })
        }
    }
})

adminRoute.post("/login", async (req, res) => {
    const { email, password } = req.body
    let data = await AdminModel.findOne({ email })
    if (!data) {
        return res.send({ "message": "No user found" })
    }
    try {
        if (password === data.password) {
            var token = jwt.sign({ adminID: data._id }, process.env.key);
            var refreshtoken = jwt.sign({ adminID: data._id }, process.env.key, { expiresIn: 60 * 1000 });
            res.status(201).send({
                "message": "Validation done",
                "token": token,
                "refresh": refreshtoken,
                "name": data.name,
                "id": data._id
            })
        } else {
            res.status(401).send({ "message": "INVALID credentials" })
        }
    } catch (err) {
        res.status(500).send({ "ERROR": err })
    }
})


adminRoute.post("/logout", async (req, res) => {
    const token = req.headers.authorization
    if (token) {
        const blacklistedData = JSON.parse(fs.readFileSync("./blacklist.json", "utf-8"))
        blacklistedData.push(token)

        fs.writeFileSync("./blacklist.json", JSON.stringify(blacklistedData))
        res.send({ "message": "Logout done successfully" })
    }
    else {
        res.send({ "message": "Please login" })
    }
})


module.exports = {
    adminRoute
}