const { userModel, guestModel, userGroupModel } = require('./../models');
const { getGroupsByUser } = require("./group.controller");
// const jwt = require('jsonwebtoken');
const usuarioConectado = async (uid = '') => {

    const usuario = await userModel.findByPk(uid);
    usuario.online = 1;
    await usuario.save();
    return usuario;
}

const usuarioDesconectado = async (uid = '') => {
    const usuario = await userModel.findByPk(uid);
    usuario.online = 0;
    await usuario.save();
    return usuario;
}
const grabarlectura = async (payload, io, uid) => {
    try {
        console.log('grabando-lectura');
        // const { uid } = jwt.verify(payload.guest, process.env.SECRETORPRIVATEKEY);
        const { code, user_id } = JSON.parse(payload.code);
        const guest = await guestModel.findOne({
            where: { state: 1, code: code },
            attributes: {
                exclude: [
                    "createdAt",
                    "updatedAt",
                ],
            }
        });
        if (!guest) return io.to(`user ${uid}`).emit('mensaje-personal', { error: true, msg: 'La invitación no es valida' });

        if (guest.user_id == uid) return io.to(`user ${uid}`).emit('mensaje-personal', { error: true, msg: 'La invitación fue creada por usted' });

        const userGroup = await userGroupModel.findOne({
            where: {
                group_id: guest.group_id,
                user_id: uid,
                state: 1
            }
        })
        console.log(userGroup)
        if (userGroup) return io.to(`user ${uid}`).emit('mensaje-personal', { error: true, msg: 'Ya perteneces al círculo de confianza' });

        await guestModel.update(
            {
                state: 0,
                guest_id: uid
            },
            { where: { code: code } }
        );
        console.log('editado')
        //reigstro entre usuario y grupo
        const groupUser = new userGroupModel({
            "user_id": uid,
            "group_id": guest.group_id,
            "reason": "guest"
        })
        await groupUser.save();
        console.log('guardado')
        // obtener mis grupos
        let circlesTrust = await getGroupsByUser(guest.user_id);
        let circlesTrustGuest = await getGroupsByUser(uid);
        console.log('enviando a', user_id)
        io.to(`user ${user_id}`).emit('mensaje-personal', { error: false, circlesTrustGuest: circlesTrust });
        io.to(`user ${uid}`).emit('mensaje-personal', { error: false, circlesTrustGuest: circlesTrustGuest });
        // res.json({ msg: 'Invitación aceptada', circlesTrustGuest });
    } catch (error) {
        console.log(error);
    }
}
const grabarMensaje = async (payload) => {

    /*
        payload: {
            de: '',
            para: '',
            texto: ''
        }
    */

    try {
        const mensaje = new Mensaje(payload);
        await mensaje.save();

        return true;
    } catch (error) {
        return false;
    }

}



module.exports = {
    usuarioConectado,
    usuarioDesconectado,
    grabarMensaje,
    grabarlectura
}


