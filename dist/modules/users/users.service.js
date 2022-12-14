"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const customer_exception_1 = require("../../core/exceptions/customer.exception");
const cryptogram_1 = require("../../utils/cryptogram");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let UsersService = class UsersService {
    constructor(usersModel, configService) {
        this.usersModel = usersModel;
        this.configService = configService;
    }
    async create(createUserDto) {
        const createUser = new this.usersModel(createUserDto);
        return createUser.save();
    }
    async findAll(query) {
        const users = await this.usersModel
            .find()
            .skip(query.pageSize * query.pageNum)
            .limit(query.pageSize)
            .sort({ _id: -1 })
            .exec();
        return users;
    }
    async findOneById(id) {
        const user = await this.usersModel.findById(id);
        return user;
    }
    async findOne(query) {
        const user = await this.usersModel.findOne(query);
        return user;
    }
    async update(id, updateUserDto) {
        const modifyUser = await this.usersModel.findByIdAndUpdate(id, updateUserDto);
        return modifyUser;
    }
    async remove(id) {
        await this.usersModel.findByIdAndDelete(id);
        return `This action removes a #${id} user`;
    }
    async register(body) {
        const { account, password, rePassword } = body;
        if (password !== rePassword) {
            throw new customer_exception_1.CustomerException(1, "???????????????????????????");
        }
        const user = await this.findOne({ account });
        if (user && Object.keys(user).length !== 0) {
            throw new customer_exception_1.CustomerException(1, "???????????????");
        }
        const salt = (0, cryptogram_1.makeSalt)();
        const hashPwd = (0, cryptogram_1.encryptPassword)(password, salt);
        try {
            await this.create(Object.assign(Object.assign({}, body), { password: hashPwd, salt }));
        }
        catch (error) {
            throw new customer_exception_1.CustomerException(2, error);
        }
        return;
    }
    async wxRegister(body) {
        const password = "Aa123456";
        const salt = (0, cryptogram_1.makeSalt)();
        const hashPwd = (0, cryptogram_1.encryptPassword)(password, salt);
        try {
            const createUser = new this.usersModel(Object.assign(Object.assign({}, body), { password: hashPwd, salt, login_method: "weixin" }));
            return createUser.save();
        }
        catch (error) {
            throw new customer_exception_1.CustomerException(2, error);
        }
    }
    async weixinLogin(code) {
        const res = await axios_1.default.get("https://api.weixin.qq.com/sns/jscode2session", {
            params: { appid: this.configService.get("appid"), secret: this.configService.get("secret"), js_code: code, grant_type: "authorization_code" }
        });
        if (res.data.errcode === 40029) {
            throw new customer_exception_1.CustomerException(3, "??????????????????");
        }
        else if (res.data.errcode === 45011) {
            throw new customer_exception_1.CustomerException(1, "?????????????????????????????????");
        }
        else if (res.data.errcode === 40226) {
            throw new customer_exception_1.CustomerException(1, "????????????????????????????????????????????? ");
        }
        else if (res.data.errcode === -1) {
            throw new customer_exception_1.CustomerException(1, "?????????????????????????????? ");
        }
        else if (res.data.errcode) {
            throw new customer_exception_1.CustomerException(1, res.data.errmsg);
        }
        return res.data;
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)("Users")),
    __metadata("design:paramtypes", [mongoose_2.Model, config_1.ConfigService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map