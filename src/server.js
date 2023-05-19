const express = require("express");
const path = require("path");
const cors = require("cors");
const admin = require("firebase-admin");

const dbConnectionSql = require("./configdb");

const fileUpload = require("express-fileupload");
const { createServer } = require('http');

const serviceAccount = require("./keys/privaap-2fce9-firebase-adminsdk-ci24s-b7b2200ba8.json");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = createServer(this.app);

    this.userPath = "/api/users";
    this.groupPath = "/api/groups";
    this.guestPath = "/api/guests";
    this.alertPath = "/api/alerts";

    this.versionPath = "/api/version";

    //conectar a DB
    this.contectDB();

    //contect service firebase
    this.firebase();

    //Middlewares
    this.middlewares();

    //Rutas de mi aplicación
    this.routes();

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
    this.app.use(express.json({ limit: '50mb' }));
    //cors
    this.app.use(cors());
    //lectura y parseo del body
    this.app.use(express.json());
    // Directorio Público
    const publicPath = path.resolve(__dirname, './../public');
    this.app.use(express.static(publicPath));
  }

  routes() {
    this.app.use(this.userPath, require("./routes/user.route"));
    this.app.use(this.groupPath, require("./routes/group.route"));
    this.app.use(this.guestPath, require("./routes/guest.route"));
    this.app.use(this.alertPath, require("./routes/alert.route"));
    this.app.use(this.versionPath, require("./routes/version.route"));
  }
  listen() {
    this.server.listen(this.port, () => {
      console.log('Servidor corriendo en puerto', this.port);
    });
  }
}
module.exports = Server;