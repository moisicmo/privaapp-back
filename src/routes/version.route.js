const { Router } = require("express");
const { check } = require("express-validator");


const { validarCampos, } = require("../middleware");

const {
    versionGet
} = require("../controllers/version.controller");
const router = Router();

router.post(
    "/",
    [
        check("version", "La version es obligatorio").not().isEmpty(),
        check("store", "La tienda es obligatoria").not().isEmpty(),
        validarCampos,
    ],
    versionGet
);

module.exports = router;
