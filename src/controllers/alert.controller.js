const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { userGroupModel, userModel, alertModel } = require("../models");
const { Op } = require("sequelize");
const admin = require("firebase-admin");

const registerAlert = async (req = Request, res = Response) => {
    try {
        const { group_id, lat, lng } = req.body;
        //obtenemos el id del usuario
        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);
        //obtenemos al usuario
        const user = await userModel.findOne({
            where: { id: uid }, attributes: {
                exclude: [
                    "code",
                    "password",
                    "state",
                    "createdAt",
                    "updatedAt",
                ],
            },
        })
        //obtenemos todos los tokens notifications que pertenecen al grupo solicitado
        const tokens = [];
        const usersGroup = await userGroupModel.findOne({
            where: { user_id: uid, group_id: group_id, state: 1 },
            attributes: {
                exclude: [
                    "id",
                    "user_id",
                    "state",
                    "createdAt",
                    "updatedAt",
                ],
            },
        });
        if (!usersGroup) {
            return res.status(400).json({
                errors: [
                    {
                        msg: "El grupo seleccionado no existe",
                    }
                ]
            });
        }
        usersGroup.dataValues.users = await userGroupModel.findAll({
            where: { group_id: usersGroup.group_id, state: 1 },
            attributes: {
                exclude: [
                    "id",
                    "user_id",
                    "group_id",
                    "state",
                    "createdAt",
                    "updatedAt",
                ],
            },
            include: [
                {
                    model: userModel,
                    required: true,
                    where: { state: 1, id: { [Op.not]: uid }, },
                    attributes: {
                        exclude: [
                            "name",
                            "last_name",
                            "email",
                            "phone",
                            "gender",
                            "number_wp",
                            "code",
                            "password",
                            "state",
                            "createdAt",
                            "updatedAt",
                        ],
                    },
                },
            ],
        });

        for await (const key of usersGroup.dataValues.users) {
            if (key.user.tk_notification != null) {
                tokens.push(key.user.tk_notification)
            }

        }
        //si no hay tokens se manda mensaje de error
        if (tokens.length == 0) {
            return res.json({
                error: true,
                msg: "Lamentablemente no se pudo alertar a nadie"
            });
        }
        console.log(tokens)
        //agregamos la fecha y la hora
        let data = {};
        var today = new Date();
        // var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds();

        data.date = JSON.stringify(today);
        data.latitude = lat;
        data.longitude = lng;
        data.user = JSON.stringify(user);
        //registar la alerta
        const alert = new alertModel();
        alert.user_id = uid;
        alert.group_id = group_id;
        alert.latitude = lat;
        alert.longitude = lng;
        await alert.save();

        //preparamos el mensaje
        const message = {
            tokens: tokens,
            notification: {
                title: 'Alerta de ayuda',
                body: `${user.name} ${user.last_name} necesita de tu ayuda`,
            },
            data: data,
            android: {
                priority: "normal",
                notification: {
                    visibility: 'public',
                    channelId: 'title',
                    priority: 'max',
                    defaultVibrateTimings: true,
                    icon: 'stock_ticker_update',
                    color: '#419388',
                    sound: 'default',
                    notification_priority: 'priority_high'
                }
            },
            apns: {
                payload: {
                    aps: {
                        contentAvailable: true,
                        mutableContent: 1,
                        sound: 'default',
                        priority: 'high'
                    },
                },
                headers: {
                    "apns-priority": "5",
                },
            },
        };
        // if (image != null) {
        //     message.notification.image = image;
        // }
        admin
            .messaging()
            .sendMulticast(message)
            .then((response) => {
                console.log(response);
                return res.json({ msg: "Successfully sent message", message: response });
            })
            .catch((error) => {
                console.log(error);
                return res.status(400).json({
                    errors: [
                        {
                            msg: error,
                        }
                    ]
                });
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
module.exports = {
    registerAlert
};
