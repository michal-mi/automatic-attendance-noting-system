const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');
const fileReader = require()
const fs = require('fs');

describe('Groups Endpoints', () => {

    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenStudent = jwt.sign({ user_role: 4 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenManager = jwt.sign({ user_role: 2 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    var text = fs.readFileSync('./tests/dataForTesting/getAttendanceList.json', 'utf8')
    var data = JSON.parse(text)

    test.each(data)('get attendance list', async (item) => {
        const res = await requestWithSupertest.post('/groups/getOnlyDataAboutGroupSubject/')
            .send(item)
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all groups by lecturer', async () => {
        const res = await requestWithSupertest.get('/groups/getAllGroups/')
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all groups by admin', async () => {
        const res = await requestWithSupertest.get('/groups/getAllGroups/')
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all groups from facility by lecturer', async () => {
        const res = await requestWithSupertest.post('/groups/getAllGroupsFromFacility/')
            .send({
                id: 1
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all groups from facility by student', async () => {
        const res = await requestWithSupertest.post('/groups/getAllGroupsFromFacility/')
            .send({
                id: 1
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search groups by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroups/')
            .send({
                id: 1,
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('search groups by student', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroups/')
            .send({
                id: 1,
                semester: 2
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search groups and subjects by lecturer', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroupsAndSubjects/')
            .send({
                facility_id: 1,
                lecturer_id: 3,
                subject_id: 1,
                group_id: 1,
                semester: 2
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('search groups and subjects by lecturer - subject id and group id is empty', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroupsAndSubjects/')
            .send({
                facility_id: 1,
                lecturer_id: 3,
                subject_id: "",
                group_id: "",
                semester: 2
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('search groups and subjects by lecturer - group id is empty', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroupsAndSubjects/')
            .send({
                facility_id: 1,
                lecturer_id: 3,
                subject_id: 1,
                group_id: "",
                semester: 2
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('search groups and subjects by lecturer - subject id is empty', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroupsAndSubjects/')
            .send({
                facility_id: 1,
                lecturer_id: 3,
                subject_id: "",
                group_id: 1,
                semester: 2
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('search groups and subjects by admin', async () => {
        const res = await requestWithSupertest.post('/groups/searchGroupsAndSubjects/')
            .send({
                facility_id: 1,
                lecturer_id: 3,
                subject_id: 1,
                group_id: 1,
                semester: 2
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get data of list of students for group in subject by lecturer', async () => {
        const res = await requestWithSupertest.post('/groups/getDataAboutGroupSubject/')
            .send({
                facility_id: 1,
                subject_group_id: "1-1"
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get data of list of students for group in subject by admin', async () => {
        const res = await requestWithSupertest.post('/groups/getDataAboutGroupSubject/')
            .send({
                facility_id: 1,
                subject_group_id: "1-1"
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get data of list of classes for group in subject by lecturer', async () => {
        const res = await requestWithSupertest.post('/groups/getDataAboutGroupSubject1/')
            .send({
                facility_id: 1,
                subject_group_id: "1-1"
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get data of list of classes for group in subject by admin', async () => {
        const res = await requestWithSupertest.post('/groups/getDataAboutGroupSubject1/')
            .send({
                facility_id: 1,
                subject_group_id: "1-1"
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get only data about group-subject by lecturer', async () => {
        const res = await requestWithSupertest.post('/groups/getOnlyDataAboutGroupSubject/')
            .send({
                facility_id: 1,
                subject_group_id: "1-1"
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get only data about group-subject by admin', async () => {
        const res = await requestWithSupertest.post('/groups/getOnlyDataAboutGroupSubject/')
            .send({
                facility_id: 1,
                subject_group_id: "1-1"
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all group names from facility by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/getAllGroupsNamesFromFacility/')
            .send({
                facility_id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get only data about group-subject by admin', async () => {
        const res = await requestWithSupertest.post('/groups/getAllGroupsNamesFromFacility/')
            .send({
                facility_id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: 1, 
                group_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('create group by facility manager - facility id is empty', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: "", 
                group_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create group by facility manager - facility id is undefined', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: undefined, 
                group_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create group by facility manager - invalid group name', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: 1, 
                group_name: "", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create group by facility manager - invalid group year', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: 1, 
                group_name: "Test", 
                year: "", 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create group by facility manager - invalid group semester', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: 1, 
                group_name: "Test", 
                year: 1, 
                semester: ""
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/createGroup/')
            .send({
                facility_id: 1, 
                group_name: "Test", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get one group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/getOneGroup/')
            .send({
                facility_id: 1,
                id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get one group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/getOneGroup/')
            .send({
                facility_id: 1,
                id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: 1, 
                group_name: "IIST 2.1/1", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('update one group by facility manager - facility id is empty', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: "", 
                group_name: "IIST 2.1/1", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one group by facility manager - facility id is undefined', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: undefined, 
                group_name: "IIST 2.1/1", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one group by facility manager - invalid group name', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: 1, 
                group_name: "", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one group by facility manager - invalid group year', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: 1, 
                group_name: "IIST 2.1/1", 
                year: "", 
                semester: 2
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one group by facility manager - invalid group semester', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: 1, 
                group_name: "IIST 2.1/1", 
                year: 1, 
                semester: ""
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('update one group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/updateOneGroup/')
            .send({
                id: 1,
                facility_id: 1, 
                group_name: "IIST 2.1/1", 
                year: 1, 
                semester: 2
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('add students to group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/addStudentsToGroup/')
            .send({
                id: 30,
                students_array: [17]
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('add students to group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/addStudentsToGroup/')
            .send({
                id: 30,
                students_array: [17]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete students from group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/deleteStudentsFromGroup/')
            .send({
                id: 30,
                students_array: [17]
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete students from group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/deleteStudentsFromGroup/')
            .send({
                id: 30,
                students_array: [17]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete one group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/deleteOneGroup/')
            .send({
                group_id: 30
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete one group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/deleteOneGroup/')
            .send({
                group_id: 30
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get dates and time for group by facility manager', async () => {
        const res = await requestWithSupertest.post('/groups/getDatesAndTime/')
            .send({
                group_id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get dates and time for group by admin', async () => {
        const res = await requestWithSupertest.post('/groups/getDatesAndTime/')
            .send({
                group_id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    

    server.close()
})