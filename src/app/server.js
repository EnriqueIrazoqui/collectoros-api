const createApp = require("./app");
const env = require("../config/env");

const app = createApp();

app.listen(env.port, () => {
    console.log(`CollectorsOS API running on port ${env.port}`);
});
