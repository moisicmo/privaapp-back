const { request, response } = require("express");
const bcryptjs = require("bcryptjs");
const { omit } = require("lodash");
const { customAlphabet } = require("nanoid");
const { gerateJWT } = require("../helpers/generate-jwt");
const { transporter } = require("../helpers/mailer");
const { userModel, groupModel, userGroupModel, } = require("../models");
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);



const registerUser = async (req = Request, res = Response) => {
  const { name, email, password } = req.body;
  try {
    const user = new userModel(req.body);

    //generar codigo
    const nanoid = customAlphabet("1234567890", 6);
    const codeg = nanoid();
    //encriptar codigo
    const salt = bcryptjs.genSaltSync();
    user.code = bcryptjs.hashSync(codeg, salt);
    user.password = bcryptjs.hashSync(password, salt);
    user.state = 0;
    //enviar codigo por correo
    let verificationLink = `código: ${codeg}`;
    console.log(email)
    await transporter.sendMail({
      from: `"CDD " <${process.env.USERGMAIL}>`, // sender address
      to: email,
      subject: "Registro de cuenta", // Subject line
      html: `
        <tr>
            <td class="container-padding header" align="center" style="font-family:Helvetica, Arial, sans-serif;font-size:28px;font-weight:bold;padding-bottom:12px;color:#4c4c4c;">
            Hola |
                <font color="#ffa500">
                ${name}
                </font>
            </td>
        </tr>
        <div align="center">
            <img src="https://res.cloudinary.com/dzkjkkvlp/image/upload/v1681937294/logo_xtv2ci.png" style="width:150px;height:150px;">
        </div>
        <br>
        <b> Inserta el siguiente código para completar el proceso</b>
        <br>
        <h1>${verificationLink}<h1/>
        `, // html body
    });

    await user.save();

    res.json({
      msg: `Se envió un código de verificación al correo ${email}`,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [
        {
          msg: `Hable con el administrador ${error}`,
        }
      ]
    });
  }
};
const validateUser = async (req = Request, res = Response) => {
  const { code, tk_notification } = req.body;
  const { id } = req.params;
  try {
    //encontrar user
    const user = await userModel.findByPk(id);

    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: `No existe ningún jugador con el id ${id}`,
          }
        ]

      });
    }
    //verificar codigo
    const validCode = bcryptjs.compareSync(code, user.code);
    if (!validCode) {
      return res.status(404).json({
        errors: [
          {
            msg: "codigo incorrecto"
          }
        ]
      });
    }
    //elminar todas las cuentas que tengan el mismo tk_notification
    const listUsersawait = await userModel.findAll({
      where: { tk_notification: tk_notification }
    });
    if (listUsersawait) {
      for await (const iterator of listUsersawait) {
        await userModel.update(
          {
            tk_notification: null
          },
          { where: { id: iterator.id } }
        );
      }
    }
    if (req.files) {
      //agregar ubicación de la imagen
      const { tempFilePath } = req.files.archivo
      const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: 'usersprivaap' });
      //modificamos y damos acceso al usuario
      user.avatar = secure_url;
    }
    //crear grupo por defecto
    const group = new groupModel({
      "name": "alertar",
      "description": "grupo por defecto"
    });

    await group.save();
    const groupUser = new userGroupModel({
      "user_id": user.id,
      "group_id": group.id,
      "reason": "creator"
    })
    await groupUser.save();

    await userModel.update(
      {
        state: 1,
        avatar: user.avatar,
        tk_notification: tk_notification
      },
      { where: { id: id } }
    );
    //enviamos correo de bienvenida
    await transporter.sendMail({
      from: `"CDD " <${process.env.USERGMAIL}>`, // sender address
      to: user.email,
      subject: "Bienvenido(a)", // Subject line
      html: `
            <tr>
                <td class="container-padding header" align="center" style="font-family:Helvetica, Arial, sans-serif;font-size:28px;font-weight:bold;padding-bottom:12px;color:#4c4c4c;">
                Hola |
                    <font color="#ffa500">
                    ${user.name}
                    </font>
                </td>
            </tr>
            <div align="center">
                <img src="https://res.cloudinary.com/dzkjkkvlp/image/upload/v1681937294/logo_xtv2ci.png" style="width:150px;height:150px;">
            </div>
            <br>
            <b> Te damos la bienvenida a PRIVAAP </b>
            `, // html body
    });
    //generar token
    let token = await gerateJWT(user.id);
    res.json({
      msg: `Bienvenido a PRIVAAP`, token, user: omit(user.toJSON(), ["code",
        "state",
        "tk_notification",
        "password",
        "createdAt",
        "updatedAt",])
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [
        {
          msg: "Hable con el administrador"
        }
      ]
    });
  }
};
const loginUser = async (req = Request, res = Response) => {
  const { email, password, tk_notification } = req.body;
  try {
    //encontrar user
    const user = await userModel.findOne({
      where: {
        email: email,
        state: 1
      },
      attributes: {
        exclude: [
          "code",
          "state",
          "tk_notification",
          "createdAt",
          "updatedAt",
        ],
      },
    });
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: `No existe ningún usuario con el correo ${email}`,
          }
        ]

      });
    }
    //verificar contraseña
    const validCode = bcryptjs.compareSync(password, user.password);
    if (!validCode) {
      return res.status(404).json({
        errors: [
          {
            msg: "contraseña incorrecta"
          }
        ]
      });
    }
    //elminar todas las cuentas que tengan el mismo tk_notification
    const listUsersawait = await userModel.findAll({
      where: { tk_notification: tk_notification }
    });
    if (listUsersawait) {
      for await (const iterator of listUsersawait) {
        await userModel.update(
          {
            tk_notification: null
          },
          { where: { id: iterator.id } }
        );
      }
    }
    //generar token
    let token = await gerateJWT(user.id);
    await userModel.update(
      {
        tk_notification: tk_notification
      },
      { where: { id: user.id } }
    );
    res.json({
      msg: `Bienvenido a PRIVAAP`, token, user: omit(user.toJSON(), "password")
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [
        {
          msg: "Hable con el administrador",
        }
      ]

    });
  }
};
const logouth = async (req = Request, res = Response) => {
  try {
    const token = req.header("authorization");
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);

    await userModel.update(
      {
        tk_notification: null
      },
      { where: { id: uid } }
    );
    res.json({ msg: `Cierre de sesión` });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [
        {
          msg: "Hable con el administrador",
        }
      ]
    });
  }
}
const sendCodeByChangePassword = async (req = Request, res = Response) => {
  try {
    const { email } = req.body;

    //buscar al usuario
    const user = await userModel.findOne({
      where: { email: email, state: 1 }
    });
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: `No existe ningún usuario con el correo ${email}`,
          }
        ]

      });
    }
    //generar codigo
    const nanoid = customAlphabet("1234567890", 6);
    const codeg = nanoid();
    //encriptar codigo
    const salt = bcryptjs.genSaltSync();
    //enviar codigo por correo
    let verificationLink = `código: ${codeg}`;
    await transporter.sendMail({
      from: `"CDD " <${process.env.USERGMAIL}>`, // sender address
      to: user.email,
      subject: "Cambio de contraseña", // Subject line
      html: `
            <tr>
                <td class="container-padding header" align="center" style="font-family:Helvetica, Arial, sans-serif;font-size:28px;font-weight:bold;padding-bottom:12px;color:#4c4c4c;">
                Hola |
                    <font color="#ffa500">
                    ${user.name}
                    </font>
                </td>
            </tr>
            <div align="center">
                <img src="https://res.cloudinary.com/dzkjkkvlp/image/upload/v1681937294/logo_xtv2ci.png" style="width:150px;height:150px;">
            </div>
            <br>
            <b> Inserta el siguiente código para cambiar la contraseña</b>
            <br>
            <h1>${verificationLink}<h1/>
            `, // html body
    });
    //cambiamos el codigo
    await userModel.update(
      {
        code: bcryptjs.hashSync(codeg, salt)
      },
      { where: { id: user.id } }
    );
    res.json({ msg: `Se envió un código de verificación al correo ${user.email}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [
        {
          msg: 'Hable con el administrador',
        }
      ]
    });
  }
}

const validateChangePassword = async (req = Request, res = Response) => {
  try {
    const { email, code, password } = req.body;


    //buscar al usuario
    const user = await userModel.findOne({
      where: { email: email, state: 1 }
    });
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: `No existe ningún usuario con el correo ${email}`,
          }
        ]

      });
    }
    //verificar codigo
    const validCode = bcryptjs.compareSync(code, user.code);
    if (!validCode) {
      return res.status(404).json({
        errors: [
          {
            msg: "codigo incorrecto"
          }
        ]
      });
    }
    //encriptar password
    const salt = bcryptjs.genSaltSync();
    //enviar confirmación de cambio de contraseña
    await transporter.sendMail({
      from: `"CDD " <${process.env.USERGMAIL}>`, // sender address
      to: user.email,
      subject: "Cambio de contraseña", // Subject line
      html: `
            <tr>
                <td class="container-padding header" align="center" style="font-family:Helvetica, Arial, sans-serif;font-size:28px;font-weight:bold;padding-bottom:12px;color:#4c4c4c;">
                Hola |
                    <font color="#ffa500">
                    ${user.name}
                    </font>
                </td>
            </tr>
            <div align="center">
                <img src="https://res.cloudinary.com/dzkjkkvlp/image/upload/v1681937294/logo_xtv2ci.png" style="width:150px;height:150px;">
            </div>
            <br>
            <b> Se realizó correctamente el cambio de la contraseña </b>
            <br>
            `, // html body
    });
    //cambiamos el codigo
    await userModel.update(
      {
        password: bcryptjs.hashSync(password, salt)
      },
      { where: { id: user.id } }
    );
    res.json({ msg: `Se cambio correctamente la contraseña` });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: [
        {
          msg: 'Hable con el administrador',
        }
      ]
    });
  }
}
const verifyPassword = async (req = Request, res = Response) => {
  try {
    const token = req.header("authorization");
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);
    const { password } = req.body;

    const user = await userModel.findOne({
      where: { id: uid }
    });
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: `No existe ningún usuario con el correo ${email}`,
          }
        ]

      });
    }
    //verificar contraseña
    const validCode = bcryptjs.compareSync(password, user.password);
    if (!validCode) {
      return res.status(404).json({
        errors: [
          {
            msg: "contraseña incorrecta"
          }
        ]
      });
    }
    res.json({ msg: 'correcto' });
  } catch (error) {
    res.status(500).json({
      errors: [
        {
          msg: 'Hable con el administrador',
        }
      ]
    });
  }
}
const updateImage = async (req = Request, res = Response) => {
  try {
    const token = req.header("authorization");
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);

    const user = await userModel.findOne({
      where: { id: uid }
    });
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: `No existe el usuario`,
          }
        ]

      });
    }
    //agregar ubicación de la imagen
    const { tempFilePath } = req.files.archivo
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: 'usersprivaap' });
    //modificamos y damos acceso al usuario
    user.avatar = secure_url;
    await user.save();
    res.json({ msg: `Se cambio correctamente la imagen`, image: user.avatar });

  } catch (error) {
    res.status(500).json({
      errors: [
        {
          msg: 'Hable con el administrador',
        }
      ]
    });
  }
}
module.exports = {
  registerUser,
  validateUser,
  loginUser,
  logouth,
  sendCodeByChangePassword,
  validateChangePassword,
  verifyPassword,
  updateImage
};
