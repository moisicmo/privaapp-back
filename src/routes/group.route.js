const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarArchivoSubir } = require("../middleware");

const { validarJWT } = require('../middleware');

const {
    groupsGet,
    groupGet,
    registerGroup,
    editGroup,
    deleteGroup,
    removeUserFromGroupId
} = require("../controllers/group.controller");
const router = Router();

//get all users
router.get("/", validarJWT, groupsGet);

//get one user
router.get("/:id", validarJWT, groupGet);

//register group
router.post(
    "/register",
    [
        check("name", "El nombre es obligatorio").not().isEmpty(),
        check("description", "La descripcion es obligatorio").not().isEmpty(),
        check("level", "El nivel de influencia es obligatorio").not().isEmpty(),
        validarCampos,
    ],
    validarJWT,
    registerGroup
);
//edit group
router.put(
    "/:id",
    validarJWT,
    editGroup
);
//delete group
router.delete("/:id", validarJWT, deleteGroup)
//remove user from groupID
router.delete("/:groupId/user/:userId", validarJWT, removeUserFromGroupId)
module.exports = router;
