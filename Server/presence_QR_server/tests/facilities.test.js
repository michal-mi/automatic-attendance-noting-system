const server = require('../index.js');
const supertest = require('supertest');
const facility = require("../models/facility.js")
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');
const fs = require('fs');

describe('Facilities Endpoints', () => {
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenStudent = jwt.sign({ user_role: 4 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    var text = fs.readFileSync('./tests/dataForTesting/addFacilitiesTest.json', 'utf8')
    var dataAdd = JSON.parse(text)

    test.each(dataAdd)('Add one facility', async (item) => {
        const res = await requestWithSupertest.post('/facilities/createNewFacility')
            .send(item)
            .set('Authorization', tokenAdmin);
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    var text = fs.readFileSync('./tests/dataForTesting/searchOneFacilityTest.json', 'utf8')
    var dataSearch = JSON.parse(text)


    test.each(dataSearch)('Search one facility', async (item) => {
        const res = await requestWithSupertest.post('/facilities/searchFacilities/')
            .send(item)
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    var text = fs.readFileSync('./tests/dataForTesting/updateOneFacilityTest.json', 'utf8')
    var dataUpdate = JSON.parse(text)

    test.each(dataUpdate)('Update one facility', async (item) => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityNameAndStatus/')
            .send(item)
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
    })

    it('get all facilities by admin', async () => {
        const res = await requestWithSupertest.get('/facilities/getAllFacilities/')
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get all facilities by lecturer', async () => {
        const res = await requestWithSupertest.get('/facilities/getAllFacilities/')
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all facility names by admin', async () => {
        const res = await requestWithSupertest.get('/facilities/getAllFacilitiesNames/')
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get all facility names by lecturer', async () => {
        const res = await requestWithSupertest.get('/facilities/getAllFacilitiesNames/')
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get facility data by id by admin', async () => {
        const res = await requestWithSupertest.post('/facilities/getOneFacilityDataByID/')
            .send({
                id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get facility data by id by student', async () => {
        const res = await requestWithSupertest.post('/facilities/getOneFacilityDataByID/')
            .send({
                id: 1
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get last facility id by admin', async () => {
        const res = await requestWithSupertest.get('/facilities/getLastFacilityID/')
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get last facility id by student', async () => {
        const res = await requestWithSupertest.get('/facilities/getLastFacilityID/')
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create facility by student', async () => {
        const res = await requestWithSupertest.post('/facilities/createNewFacility/')
            .send({
                id: 100,
                facility_name: "abc",
                facility_status: 1,
                facility_logo: ""
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create facility by admin - invalid facility_name', async () => {
        const res = await requestWithSupertest.post('/facilities/createNewFacility/')
            .send({
                id: 100,
                facility_name: "",
                facility_status: 1,
                facility_logo: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create facility by admin - invalid facility_status is empty', async () => {
        const res = await requestWithSupertest.post('/facilities/createNewFacility/')
            .send({
                id: 100,
                facility_name: "abc",
                facility_status: "",
                facility_logo: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create facility by admin - invalid facility_status is undefined', async () => {
        const res = await requestWithSupertest.post('/facilities/createNewFacility/')
            .send({
                id: 100,
                facility_name: "abc",
                facility_status: undefined,
                facility_logo: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create facility by admin without id', async () => {
        const res = await requestWithSupertest.post('/facilities/createNewFacility/')
            .send({
                facility_name: "abc",
                facility_status: 1,
                facility_logo: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('update facility logo by student', async () => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityLogo/')
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update facility logo by student', async () => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityShortLogo/')
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search facilities by student', async () => {
        const res = await requestWithSupertest.post('/facilities/searchFacilities/')
            .send({
                id: "", 
                facility_name: "", 
                facility_status: ""
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search facilities by admin - every data is empty', async () => {
        const res = await requestWithSupertest.post('/facilities/searchFacilities/')
            .send({
                id: "", 
                facility_name: "", 
                facility_status: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('search facilities by admin - facility name is empty', async () => {
        const res = await requestWithSupertest.post('/facilities/searchFacilities/')
            .send({
                id: 1, 
                facility_name: "", 
                facility_status: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('search facilities by admin - facility name is empty', async () => {
        const res = await requestWithSupertest.post('/facilities/searchFacilities/')
            .send({
                id: "", 
                facility_name: "Politechnika Lubelska", 
                facility_status: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('update facility name and status by student', async () => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityNameAndStatus/')
            .send({
                id: 3, 
                facility_name: "def", 
                facility_status: 1
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update facility name and status by admin - invalid facility name', async () => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityNameAndStatus/')
            .send({
                id: 3, 
                facility_name: "", 
                facility_status: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update facility name and status by admin - facility status is empty', async () => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityNameAndStatus/')
            .send({
                id: 3, 
                facility_name: "def", 
                facility_status: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update facility name and status by admin - facility status is undefined', async () => {
        const res = await requestWithSupertest.post('/facilities/updateFacilityNameAndStatus/')
            .send({
                id: 3, 
                facility_name: "def", 
                facility_status: undefined
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete facility logo reference by id by admin', async () => {
        const res = await requestWithSupertest.post('/facilities/deleteOneFacilityLogoReferenceByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete facility logo reference by id by student', async () => {
        const res = await requestWithSupertest.post('/facilities/deleteOneFacilityLogoReferenceByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete facility logo by id by admin', async () => {
        const res = await requestWithSupertest.post('/facilities/deleteOneFacilityLogoByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete facility logo by id by student', async () => {
        const res = await requestWithSupertest.post('/facilities/deleteOneFacilityLogoByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    server.close()
})