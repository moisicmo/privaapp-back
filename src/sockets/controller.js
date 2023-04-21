const { Socket } = require('socket.io');
const { comprobarJWT } = require('./../middleware');

const { guestModel, userGroupModel } = require('../models');
const { usuarioConectado, usuarioDesconectado, grabarMensaje, grabarlectura } = require('../controllers/socket');




const socketController = async (socket = new Socket(), io) => {
    console.log('usuario', socket.handshake.headers['x-token'])
    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if (!usuario) {
        return socket.disconnect();
    }

    // Cliente autenticado
    usuarioConectado(usuario.id);

    // Ingresar al usuario a una sala en particular
    // sala global, client.id, 5f298534ad4169714548b785
    console.log('agregando al usuario', usuario.id)
    socket.join(`user ${usuario.id}`);
    socket.on('leer-invitacion', async (payload) => {
        await grabarlectura(payload, io, usuario.id);
    });
    // Escuchar del cliente el mensaje-personal
    // socket.on('mensaje-personal', async (payload) => {
    //     // TODO: Grabar mensaje
    //     await grabarMensaje(payload, io);

    // })


    socket.on('disconnect', () => {
        usuarioDesconectado(usuario.id);
    });




    socket.on('mensaje', (payload) => {
        console.log('Mensaje', payload);
        io.emit('mensaje', { admin: 'Nuevo mensaje' });
    });


}



module.exports = {
    socketController
}