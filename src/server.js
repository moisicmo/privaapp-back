const express = require("express");
const path = require("path");
const cors = require("cors");
const admin = require("firebase-admin");

const dbConnectionSql = require("./configdb");

const fileUpload = require("express-fileupload");
const { createServer } = require('http');

const serviceAccount = require("./keys/privaap-2fce9-firebase-adminsdk-ci24s-b7b2200ba8.json");

const { socketController } = require('./sockets/controller');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = createServer(this.app);
    this.io = require('socket.io')(this.server)

    this.userPath = "/api/users";
    this.groupPath = "/api/groups";
    this.guestPath = "/api/guests";
    this.alertPath = "/api/alerts"

    //conectar a DB
    this.contectDB();

    //contect service firebase
    this.firebase();

    //Middlewares
    this.middlewares();

    //Rutas de mi aplicación
    this.routes();

    // Sockets
    this.sockets();
  }

  async contectDB() {
    try {
      await dbConnectionSql.authenticate();
      console.log("Base de datos MySql conectado");
    } catch (error) {
      console.log("error" + error);
      // throw new Error( 'error'+error )
    }
  }
  firebase() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  middlewares() {
    //cors
    this.app.use(cors());
    //lectura y parseo del body
    this.app.use(express.json());
    //carga de archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    );
  }

  routes() {
    this.app.use(this.userPath, require("./routes/user.route"));
    this.app.use(this.groupPath, require("./routes/group.route"));
    this.app.use(this.guestPath, require("./routes/guest.route"));
    this.app.use(this.alertPath, require("./routes/alert.route"));
  }
  sockets() {
    this.io.on('connection', (socket) => socketController(socket, this.io))
  }
  listen() {
    this.server.listen(this.port, () => {
      console.log('Servidor corriendo en puerto', this.port);
    });
  }
}
module.exports = Server;