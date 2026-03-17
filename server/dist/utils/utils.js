"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateResponse = exports.GenerateError = void 0;
const GenerateError = (routeName, err) => {
    console.log(`Error coming from ${routeName} and the error is :`, err);
};
exports.GenerateError = GenerateError;
const GenerateResponse = (done, data, error) => {
    return {
        success: done,
        data,
        error
    };
};
exports.GenerateResponse = GenerateResponse;
