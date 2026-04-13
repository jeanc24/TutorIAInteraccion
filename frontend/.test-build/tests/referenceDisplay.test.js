"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var strict_1 = __importDefault(require("node:assert/strict"));
var referenceDisplay_1 = require("../src/lib/referenceDisplay");
function run(name, check) {
    try {
        check();
        console.log("PASS ".concat(name));
    }
    catch (error) {
        console.error("FAIL ".concat(name));
        throw error;
    }
}
run('compact practice reference keeps the same hand alignment rules as the full learn reference', function () {
    var full = (0, referenceDisplay_1.getReferenceFigureConfig)('full');
    var compact = (0, referenceDisplay_1.getReferenceFigureConfig)('compact');
    strict_1.default.equal(compact.imageClassName, full.imageClassName);
    strict_1.default.match(compact.boxClassName, /items-center/);
    strict_1.default.match(compact.boxClassName, /justify-center/);
    strict_1.default.match(compact.boxClassName, /overflow-hidden/);
});
