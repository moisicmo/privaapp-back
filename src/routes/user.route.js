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
  registerUser,
  validateUser,
  loginUser,
  logouth,
  sendCodeByChangePassword,
  validateChangePassword,
  verifyPassword,
  updateImage
} = require("../controllers/user.controller");
const router = Router();

//register user
router.post(
  "/register",
  [
    check("name", "El nombre es obligatorio").not().isEmpty(),
    check("last_name", "El nick es obligatorio").not().isEmpty(),
    check("email", "El correo no es válido").isEmail(),
    check("email").custom(emailExists),
    check("phone", "El teléfono móvil es obligatorio")
      .not()
      .isEmpty(),
    check("phone").custom(phoneExists),
    check("gender", "El nick es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  registerUser
);
//validate user
router.post(
  "/validate/:id",
  [
    // validarArchivoSubir,
    check("code", "El codigo es obligatorio").not().isEmpty(),
    check("tk_notification", "El token es necesario").not().isEmpty(),
    validarCampos
  ],
  validateUser
);
//auth player
router.post(
  "/auth",
  [
    check("email", "El correo es obligatorio").not().isEmpty(),
    check("email", "El correo no es válido").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    check("tk_notification", "El token es necesario").not().isEmpty(),
    validarCampos,
  ],
  loginUser
);

router.delete(
  "/auth",
  validarJWT,
  logouth
);

router.post(
  "/send_change_password",
  [
    check("email", "El correo es obligatorio").not().isEmpty(),
    check("email", "El correo no es válido").isEmail(),
    validarCampos,
  ],
  sendCodeByChangePassword
);

router.post(
  "/validate_change_password",
  [
    check("email", "El correo es obligatorio").not().isEmpty(),
    check("email", "El correo no es válido").isEmail(),
    check("code", "El codigo es obligatorio").not().isEmpty(),
    check("password", "La contraseña es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  validateChangePassword
);

router.post(
  "/verify_password",
  [
    validarJWT,
    check("password", "La contraseña es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  verifyPassword
);
router.post(
  "/update/image",
  [
    validarJWT,
    // validarArchivoSubir,
  ],
  updateImage
);
module.exports = router;
