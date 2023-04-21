const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarArchivoSubir } = require("../middleware");

const { validarJWT } = require('../middleware');

const {
    registerGuest,
    confirmGuest
} = require("../controllers/guest.controller");
const router = Router();

//register guest
router.post(
    "/",
    [
        check("group_id", "El id del grupp es obligatorio").not().isEmpty(),
        validarCampos,
    ],
    validarJWT,
    registerGuest
);
//confirm guest
router.post(
    "/confirm",
    [
        check("code", "El id del grupp es obligatorio").not().isEmpty(),
        validarCampos,
    ],
    validarJWT,
    confirmGuest
);
module.exports = router;
