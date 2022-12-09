const router = require("express").Router()
const users = require('../models/user');
const bcrypt = require("bcrypt")
const Joi = require("joi")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        const user = await users.getOneDataForLoginByEmail(req.body.email)
        if (error)
            return res.status(400).send({ message: error.details[0].message })
        if (!user)
            return res.status(401).send({ message: "Błędny email lub hasło!" })
        const validPassword = await bcrypt.compare(
            req.body.password,
            user[0].hash_password.toString()
        )

        if (!validPassword) {
            return res.status(401).send("Błędny email lub hasło!")
        }

        const userRole = await users.getUserRoleByUserID(user[0].id)
        const dataStoredInJWT = {
            id: user[0].id,
            facility_id: user[0]. facility_id,
            user_role: userRole[0].role_id
        }
        const token = jwt.sign(dataStoredInJWT, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
        console.log("Zalogowano użytkownika " + dataStoredInJWT.id + ". Nadano token: " + token)
        res.status(200).send({ data: token, message: "Zalogowano!" })
    } catch (error) {
        res.status(500).send({ message: "Wewnętrzny błąd serwera!" })
    }
})

router.post("/android/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        const user = await users.getOneDataForLoginByEmail(req.body.email)
        if (error)
            return res.status(400).send({ message: error.details[0].message })
        if (!user || user.length == 0)
            return res.status(401).send({ message: "Błędny email lub hasło!" })
        const validPassword = await bcrypt.compare(
            req.body.password,
            user[0].hash_password.toString()
        )
        if (!validPassword) {
            return res.status(401).send({ message: "Błędny email lub hasło!" })
        }

        const userRole = await users.getUserRoleByUserID(user[0].id)
        //console.log("id:" + user[0].id + " userRole" + userRole[0].role_id)
        const dataStoredInJWT = {
            id: user[0].id,
            facility_id: user[0]. facility_id,
            user_role: userRole[0].role_id
        }
        const token = jwt.sign(dataStoredInJWT, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
        const data = {id:user[0].id, userRole:userRole[0].role_id, facility:user[0].facility_id, jwt:token};
        res.status(200).send({ data:data , message: "Zalogowano!" })
 
    } catch (error) {
        res.status(500).send({ message: "Wewnętrzny błąd serwera!" })
    }
})
const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
    })
    return schema.validate(data)
}
module.exports = router