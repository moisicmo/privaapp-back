const { request, response } = require("express");
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

const { groupModel, userGroupModel, userModel } = require("../models");

const groupsGet = async (req = request, res = response) => {
    try {
        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);

        let circlesTrust = await getGroupsByUser(uid);
        res.json(circlesTrust);
    } catch (err) {
        console.log(err)
        res.status(500).json({
            errors: [
                {
                    msg: "Hable con el administrador",
                }
            ]

        });
    }
};

const groupGet = async (req = Request, res = Response) => {
    const { id } = req.params;
    const player = await groupModel.findByPk(id, {
        attributes: {
            exclude: [
                "password",
                "state",
                "tk_notification",
                "createdAt",
                "updatedAt",
            ],
        },
    });
    if (player) {
        res.json(player);
    } else {
        res.status(404).json({
            errors: [
                {
                    msg: `No existe un usuario con el id ${id}`,
                }
            ]
        });
    }
};

const registerGroup = async (req = Request, res = Response) => {
    try {
        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);

        const group = new groupModel(req.body);

        await group.save();
        const groupUser = new userGroupModel({
            "user_id": uid,
            "group_id": group.id,
            "reason": "creator"
        })
        await groupUser.save();


        let circlesTrust = await getGroupsByUser(uid);
        res.json({ msg: 'Circulo de confianza creado', circlesTrust })
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

const editGroup = async (req = Request, res = Response) => {
    try {
        const { id } = req.params;
        const { name, description, level } = req.body;

        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);
        await groupModel.update(
            {
                name: name,
                description: description,
                level: level,
            },
            { where: { id: id } }
        );
        let circlesTrust = await getGroupsByUser(uid);

        res.json({ msg: 'Circulo de confianza editado', circlesTrust })

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

const deleteGroup = async (req = Request, res = Response) => {
    try {
        const { id } = req.params;

        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);
        await userGroupModel.update(
            {
                state: 0,
            },
            { where: { group_id: id } }
        );
        await groupModel.update(
            {
                state: 0,
            },
            { where: { id: id } }
        );
        let circlesTrust = await getGroupsByUser(uid);

        res.json({ msg: 'Circulo de confianza eliminado', circlesTrust })


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

const getGroupsByUser = async (user_id) => {
    let groupList = [];
    const userGroup = await userGroupModel.findAll({
        where: { user_id: user_id, state: 1 },
        attributes: {
            exclude: [
                "id",
                "user_id",
                "state",
                "createdAt",
                "updatedAt",
            ],
        },
        include: [
            {
                model: groupModel,
                required: true,
                where: { state: 1 },
                attributes: {
                    exclude: [
                        "state",
                        "createdAt",
                        "updatedAt",
                    ],
                },
            }
        ],

    });
    for await (const key of userGroup) {
        console.log(key.reason)
        await userGroupModel.findAll({
            where: { group_id: key.group_id, state: 1 },
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
                    where: { state: 1, id: { [Op.not]: user_id }, },
                    attributes: {
                        exclude: [
                            "code",
                            "password",
                            "tk_notification",
                            "state",
                            "createdAt",
                            "updatedAt",
                        ],
                    },
                },
            ],
        }).then((result) => {

            if (key.reason == 'creator' || result.length != 0) {
                key.dataValues.users = result;
                groupList.push(key)
            }
        })
    }
    return groupList;
};
const removeUserFromGroupId = async (req = Request, res = Response) => {
    try {
        const { userId, groupId } = req.params;
        console.log(userId, groupId)

        const token = req.header("authorization");
        const bearer = token.split(" ");
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(bearerToken, process.env.SECRETORPRIVATEKEY);
        await userGroupModel.update(
            {
                state: 0,
            },
            { where: { group_id: groupId, user_id: userId } }
        );
        let circlesTrust = await getGroupsByUser(uid);

        res.json({ msg: 'Usuario elminado', circlesTrust })


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
    groupsGet,
    groupGet,
    registerGroup,
    editGroup,
    deleteGroup,
    getGroupsByUser,
    removeUserFromGroupId
};