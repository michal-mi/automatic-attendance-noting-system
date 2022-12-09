const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');

describe('Subjects Endpoints', () => {

    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenManager = jwt.sign({ user_role: 2 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    it('get all subjects by lecturer', async () => {
        const res = await requestWithSupertest.get('/subjects/getAllSubjects/')
            .set('Authorization', tokenLecturer);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all subjects by admin', async () => {
        const res = await requestWithSupertest.get('/subjects/getAllSubjects/')
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all subjects from facility by lecturer', async () => {
        const res = await requestWithSupertest.post('/subjects/getAllSubjectsFromFacility/')
            .send({
                facility_id: 1
            })
            .set('Authorization', tokenLecturer);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all subjects from facility by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/getAllSubjectsFromFacility/')
            .send({
                facility_id: 1
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all subject names from facility by facility manager', async () => {
        const res = await requestWithSupertest.post('/subjects/getAllSubjectsNamesFromFacility/')
            .send({
                facility_id: 1
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all subject names from facility by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/getAllSubjectsNamesFromFacility/')
            .send({
                facility_id: 1
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search subjects by facility manager', async () => {
        const res = await requestWithSupertest.post('/subjects/searchSubjects/')
            .send({
                id: 1,
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('search subjects by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/searchSubjects/')
            .send({
                id: 1,
                semester: 2
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create subject by facility manager', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: 1, 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('create subject by facility manager - facility id is empty', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: "", 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create subject by facility manager - facility id is undefined', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: undefined, 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create subject by facility manager - invalid subject name', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: 1, 
                subject_name: "", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create subject by facility manager - invalid subject year', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: 1, 
                subject_name: "Test", 
                year: "", 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create subject by facility manager - invalid subject semester', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: 1, 
                subject_name: "Test", 
                year: 1, 
                semester: ""
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create subject by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/createSubject/')
            .send({
                facility_id: 1, 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get one subject by facility manager', async () => {
        const res = await requestWithSupertest.post('/subjects/getOneSubject/')
            .send({
                facility_id: 1, 
                id: 1
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get one subject by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/getOneSubject/')
            .send({
                facility_id: 1, 
                id: 1
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one subject by facility manager', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: 1, 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('update one subject by facility manager - facility id is empty', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: "", 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one subject by facility manager - facility id is undefined', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: undefined, 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one subject by facility manager - invalid subject name', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: 1, 
                subject_name: "", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one subject by facility manager - invalid subject year', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: 1, 
                subject_name: "Test", 
                year: "", 
                semester: 2
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one subject by facility manager - invalid subject semester', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: 1, 
                subject_name: "Test", 
                year: 1, 
                semester: ""
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one subject by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/updateOneSubject/')
            .send({
                id: 30,
                facility_id: 1, 
                subject_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete one subject by facility manager', async () => {
        const res = await requestWithSupertest.post('/subjects/deleteOneSubject/')
            .send({
                id: 30
            })
            .set('Authorization', tokenManager);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete one subject by admin', async () => {
        const res = await requestWithSupertest.post('/subjects/deleteOneSubject/')
            .send({
                id: 30
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })
    

    server.close()
})
