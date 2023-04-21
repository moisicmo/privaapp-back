const { userModel } = require("../models/index.js");



const emailExists = async (email = "") => {
  // Verificar si el correo existe
  const existEmail = await userModel.findOne({
    where: {
      email: email,
      state: 1,
    },
  });
  if (existEmail) {
    throw new Error(`El correo: ${email}, ya está registrado`);
  }
};
const phoneExists = async (phone = "") => {
  // Verificar si el correo existe
  const existPhone = await userModel.findOne({
    where: {
      phone: phone,
      state: 1,
    },
  });
  if (existPhone) {
    throw new Error(`El teléfono: ${phone}, ya está registrado`);
  }
};

module.exports = {
  emailExists,
  phoneExists,
};
