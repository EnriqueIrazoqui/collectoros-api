const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("../routes");
const notFoundMiddleware = require("../middlewares/not-found.middleware");
const errorMiddleware = require("../middlewares/error.middleware");

function createApp() {
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use("/api/v1", routes);

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
}

module.exports = createApp;