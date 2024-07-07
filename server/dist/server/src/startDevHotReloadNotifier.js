"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDevHotReloadNotifier = void 0;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const utils_1 = require("../../commonTypes/utils");
let showedMessage = false;
const startDevHotReloadNotifier = ({ io, port }) => {
    const showMessage = () => {
        if (showedMessage)
            return;
        console.log(`\n\n${utils_1.RELOAD_NOTIFICATION}:\n\n http://localhost:${port}`);
        showedMessage = true;
    };
    if (process.env.NODE_ENV === "development") {
        fs.watchFile(path_1.default.join(__dirname, "../../../../client/configs/last_compiled.txt"), { interval: 100 }, (eventType, filename) => {
            io.emit("pls-restart");
            showMessage();
        });
    }
    else {
        showMessage();
    }
};
exports.startDevHotReloadNotifier = startDevHotReloadNotifier;
//# sourceMappingURL=startDevHotReloadNotifier.js.map