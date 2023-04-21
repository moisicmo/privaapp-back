const { Router } = require("express");
const { check } = require("express-validator");

const { validarJWT } = require('../middleware');

const { validarCampos, validarArchivoSubir } = require("../middleware");


const {
    emailExists,
    phoneExists,
    //   playerExistById,
} = require("../helpers/db-validators");

const {
    registerAlert,
} = require("../controllers/alert.controller");
const router = Router();

//register alert
router.post(
    "/register",
    [
        check("group_id", "El id del grupo es obligatorio").not().isEmpty(),
        check("lat", "La longitud es obligatorio").not().isEmpty(),
        check("lng", "La latitud obligatorio").not().isEmpty(),
        validarCampos,
    ],
    registerAlert
);

module.exports = router;
