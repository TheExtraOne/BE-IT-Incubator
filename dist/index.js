"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const settings_1 = require("./settings");
app_1.app.listen(settings_1.SETTINGS.PORT, () => {
    console.log("...server started in port " + settings_1.SETTINGS.PORT);
});
