"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
describe("/course", () => {
    let created_course = null;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).delete("/__test__/data");
    }));
    it("should return 200 and empty array", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).get("/courses").expect(index_1.STATUS_CODES.OK, []);
    }));
    it("should return 404 for not existing course", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app).get("/courses/9999").expect(index_1.STATUS_CODES.NOT_FOUND);
    }));
    it("should not create a course with incorrect input data", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app)
            .post("/courses")
            .send({ title: "" })
            .expect(index_1.STATUS_CODES.BAD_REQUEST);
        yield (0, supertest_1.default)(index_1.app).get("/courses").expect(index_1.STATUS_CODES.OK, []);
    }));
    it("should create the course with correct input data", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.app)
            .post("/courses")
            .send({ title: "front-end" })
            .expect(index_1.STATUS_CODES.CREATED);
        created_course = response.body;
        expect(created_course).toEqual({
            id: expect.any(Number),
            title: "front-end",
        });
        yield (0, supertest_1.default)(index_1.app)
            .get("/courses")
            .expect(index_1.STATUS_CODES.OK, [created_course]);
    }));
    it("should not update the course with incorrect input data", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app)
            .put(`/courses/${created_course === null || created_course === void 0 ? void 0 : created_course.id}`)
            .send({ title: "" })
            .expect(index_1.STATUS_CODES.BAD_REQUEST);
        yield (0, supertest_1.default)(index_1.app)
            .get(`/courses/${created_course === null || created_course === void 0 ? void 0 : created_course.id}`)
            .expect(index_1.STATUS_CODES.OK, created_course);
    }));
    it("should not update course that does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app)
            .put(`/courses/9999`)
            .send({ title: "new_course" })
            .expect(index_1.STATUS_CODES.NOT_FOUND);
    }));
    it("should update the course with correct input data", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.app)
            .put(`/courses/${created_course === null || created_course === void 0 ? void 0 : created_course.id}`)
            .send({ title: "back-end" })
            .expect(index_1.STATUS_CODES.OK, Object.assign(Object.assign({}, created_course), { title: "back-end" }));
        yield (0, supertest_1.default)(index_1.app)
            .get(`/courses/${created_course === null || created_course === void 0 ? void 0 : created_course.id}`)
            .expect(index_1.STATUS_CODES.OK, Object.assign(Object.assign({}, created_course), { title: "back-end" }));
    }));
});
