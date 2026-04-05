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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireNonStudent = exports.requireStudent = exports.requireTeacher = exports.requireAdmin = exports.requireSuperAdmin = exports.authenticateToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'superadmin') {
        return res.status(403).json({ message: 'Superadmin access required' });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
const requireAdmin = (req, res, next) => {
    if (!['admin', 'superadmin'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireTeacher = (req, res, next) => {
    if (!['teacher', 'admin', 'superadmin'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'Teacher access required' });
    }
    next();
};
exports.requireTeacher = requireTeacher;
const requireStudent = (req, res, next) => {
    if (!['student', 'teacher', 'admin', 'superadmin'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'Student access required' });
    }
    next();
};
exports.requireStudent = requireStudent;
const requireNonStudent = (req, res, next) => {
    if (!['superadmin', 'admin', 'teacher'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'Access denied: Students cannot perform this action' });
    }
    next();
};
exports.requireNonStudent = requireNonStudent;
