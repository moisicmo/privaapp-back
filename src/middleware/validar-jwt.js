const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const { userModel } = require('./../models');


const validarJWT = async (req = request, res = response, next) => {

    const token = req.header('authorization');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }


    try {
        const bearer = token.split(' ');
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);
        console.log(uid)
        // leer el usuario que corresponde al uid
        const usuario = await userModel.findByPk(uid);

        if (!usuario) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe DB'
            })
        }

        // Verificar si el uid tiene estado true
        if (usuario.state == 0) {
            return res.status(401).json({
                msg: 'Token no válido - usuario con estado: false'
            })
        }


        req.usuario = usuario;
        next();

    } catch (error) {

        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

}

const comprobarJWT = async (token = '') => {

    try {

        if (token.length < 10) {
            return null;
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const usuario = await userModel.findByPk(uid);

        if (usuario) {
            if (usuario.state) {
                return usuario;
            } else {
                return null;
            }
        } else {
            return null;
        }

    } catch (error) {
        return null;
    }

}



module.exports = {
    validarJWT, comprobarJWT
}