

const validaCampos = require('./validar-campos');
const validarJWT = require('./validar-jwt');
const validarArchivo = require('./validar-archivo');

module.exports = {
    ...validaCampos,
    ...validarJWT,
    ...validarArchivo,
    // ...validaRoles,
}