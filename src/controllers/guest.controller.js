const { request, response } = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { customAlphabet } = require("nanoid");
const { guestModel, userGroupModel } = require("../models");

const { getGroupsByUser } = require("./group.controller");

const registerGuest = async (req = Request, res = Response) => {
    try {
        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);

        const guest = new guestModel(req.body);

        guest.user_id = uid;
        //generar codigo
        const nanoid = customAlphabet("1234567890", 6);
        const codeg = nanoid();
        //encriptar codigo
        const salt = bcryptjs.genSaltSync();
        guest.code = bcryptjs.hashSync(codeg, salt);

        await guest.save();
        res.json({ msg: 'Invitación creada', guest })
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

const confirmGuest = async (req = Request, res = Response) => {
    try {
        console.log('holaaa');
        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);

        const { code } = req.body;
        console.log(code)
        const guest = await guestModel.findOne({
            where: { state: 1, code: code },
            attributes: {
                exclude: [
                    "createdAt",
                    "updatedAt",
                ],
            }
        });
        if (!guest) {
            return res.status(404).json({
                errors: [
                    {
                        msg: `La invitación no es valida`,
                    }
                ]
            });
        }
        if (guest.user_id == uid) {
            return res.status(404).json({
                errors: [
                    {
                        msg: `La invitación fue creada por usted`,
                    }
                ]
            });
        }
        console.log(`group_id ${guest.group_id}`)
        const guests = await guestModel.findAll({
            where: { group_id: guest.group_id, guest_id: uid }
        })
        console.log(`guests ${guests}`)
        // if (guests.length > 0) {
        //     return res.status(404).json({
        //         errors: [
        //             {
        //                 msg: `Ya perteneces al círculo de confianza`,
        //             }
        //         ]
        //     });

        // }
        await guestModel.update(
            {
                state: 0,
                guest_id: uid
            },
            { where: { code: code } }
        );
        //reigstro entre usuario y grupo
        const groupUser = new userGroupModel({
            "user_id": uid,
            "group_id": guest.group_id,
            "reason": "guest"
        })
        await groupUser.save();
        // obtener mis grupos
        let circlesTrust = await getGroupsByUser(uid);

        res.json({ msg: 'Invitación aceptada', circlesTrust });
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
    registerGuest,
    confirmGuest
};
