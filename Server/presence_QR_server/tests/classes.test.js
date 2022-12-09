const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');
const fs = require('fs');

describe('Classes Endpoints', () => {
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenStudent = jwt.sign({ user_role: 4 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenManager = jwt.sign({ user_role: 2 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    it('change student presence status by scanning code qr', async () => {
        const res = await requestWithSupertest.post('/classes/changePresenceStatus/')
            .send({
                user_id: 11,
                qr_code: "nbkr",
                gps_x: 1.23456,
                gps_y: 1.23456
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('text/plain'));
    })

    it('change student presence status by scanning code qr - when user is not in the classroom ', async () => {
        const res = await requestWithSupertest.post('/classes/changePresenceStatus/')
            .send({
                user_id: 11,
                qr_code: "nbkr",
                gps_x: 62.23456,
                gps_y: 56.23456
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(433);
        expect(res.type).toEqual(expect.stringContaining('text/plain'));
    })

    it('change attendance by lecturer', async () => {
        const res = await requestWithSupertest.post('/classes/changeAttendanceList/')
            .send({
                attendance_list:
                    [
                        {
                            first_name: 'Gabriela',
                            surname: 'Nawrocka',
                            user_id: 11,
                            status_id: 1,
                            id: 227
                        }
                    ]
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    var text = fs.readFileSync('./tests/dataForTesting/getLecturerCalendarTest.json', 'utf8')
    var dataGetCalendar = JSON.parse(text)

    test.each(dataGetCalendar)('get lecturer calendar', async (item) => {
        const res = await requestWithSupertest.post('/classes/lecturerCalendar/')
            .send(item)
            .set('Authorization', tokenLecturer)
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    var text = fs.readFileSync('./tests/dataForTesting/getLessonDataTest.json', 'utf8')
    var dataGetLesson = JSON.parse(text)

    test.each(dataGetLesson)('get lesson info', async (item) => {
        const res = await requestWithSupertest.post('/classes/oneLessonData/')
            .send(item)
            .set('Authorization', tokenLecturer)
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all classes by lecturer', async () => {
        const res = await requestWithSupertest.get('/classes/allClasses/')
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get all classes by admin', async () => {
        const res = await requestWithSupertest.get('/classes/allClasses/')
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get data needed for lecturer calendar by lecturer', async () => {
        const res = await requestWithSupertest.post('/classes/lecturerCalendar/')
            .send({
                lecturer_id: 7,
                facility_id: 1
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get data needed for lecturer calendar by admin', async () => {
        const res = await requestWithSupertest.post('/classes/lecturerCalendar/')
            .send({
                lecturer_id: 7,
                facility_id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get one lesson data by admin', async () => {
        const res = await requestWithSupertest.post('/classes/oneLessonData/')
            .send({
                lecturer_id: 7,
                facility_id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get classes calendar by lecturer', async () => {
        const res = await requestWithSupertest.post('/classes/classesCalendar/')
            .send({
                id: 1
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get classes calendar by admin', async () => {
        const res = await requestWithSupertest.post('/classes/classesCalendar/')
            .send({
                id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get data for list of class attendance by lecturer', async () => {
        const res = await requestWithSupertest.post('/classes/getAttendanceList/')
            .send({
                facility_id: 1,
                subject_group_id: "5-9",
                lesson_date: "2022-03-03",
                lecturer_id: 7
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get data for list of class attendance by admin', async () => {
        const res = await requestWithSupertest.post('/classes/getAttendanceList/')
            .send({
                facility_id: 1,
                subject_group_id: "5-9",
                lesson_date: "2022-03-03",
                lecturer_id: 7
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get attendance list for student by admin', async () => {
        const res = await requestWithSupertest.post('/classes/getAttendanceListStudent/')
            .send({
                student_id: 11,
                date: "2022-03-02"
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get attendance list for student by student', async () => {
        const res = await requestWithSupertest.post('/classes/getAttendanceListStudent/')
            .send({
                student_id: 11,
                date: "2022-03-02"
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('change attendance list by admin', async () => {
        const res = await requestWithSupertest.post('/classes/changeAttendanceList/')
            .send({
                attendance_list:
                    [
                        {
                            first_name: 'Gabriela',
                            surname: 'Nawrocka',
                            user_id: 11,
                            status_id: 1,
                            id: 227
                        }
                    ]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('change attendance list with empty data', async () => {
        const res = await requestWithSupertest.post('/classes/changeAttendanceList/')
            .send({
                attendance_list: ""
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(400);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('add classes by facility manager', async () => {
        const res = await requestWithSupertest.post('/classes/addClasses/')
            .send({
                IDs_of_days:[30], 
                classroom_id: 1, 
                subject_id: 1, 
                lecturer_id: 3, 
                group_id: 1, 
                beginning_time: "10:15", 
                ending_time: "12:00", 
                day_of_week: 5, 
                beginning_date: "2022-10-01", 
                end_date: "2022-12-31"
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('add classes by admin', async () => {
        const res = await requestWithSupertest.post('/classes/addClasses/')
            .send({
                IDs_of_days:[30], 
                classroom_id: 1, 
                subject_id: 1, 
                lecturer_id: 3, 
                group_id: 1, 
                beginning_time: "10:15", 
                ending_time: "12:00", 
                day_of_week: 5, 
                beginning_date: "2022-10-01", 
                end_date: "2022-12-31"
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining("text/html"));
    })

    it('get classes calendar for subject group by lecturer', async () => {
        const res = await requestWithSupertest.post('/classes/classesCalendarForSubjectGroup/')
            .send({
                facility_id: 1, 
                subject_group_id: "5-9"
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get classes calendar for subject group by admin', async () => {
        const res = await requestWithSupertest.post('/classes/classesCalendarForSubjectGroup/')
            .send({
                facility_id: 1, 
                subject_group_id: "5-9"
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search classes by lecturer', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: 1, 
                classroom_id: 1, 
                lecturer_id: 3
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by lecturer - only facility id is not empty', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: "", 
                classroom_id: "", 
                lecturer_id: ""
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by lecturer - only facility id and group id is not empty', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: 1, 
                classroom_id: "", 
                lecturer_id: ""
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by lecturer - only facility id and lecturer id is not empty', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: "", 
                classroom_id: "", 
                lecturer_id: 3
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by lecturer - only group id is empty', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: "", 
                classroom_id: 1, 
                lecturer_id: 3
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by lecturer - only group id and lecturer id is empty', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: "", 
                classroom_id: 1, 
                lecturer_id: ""
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by lecturer - only classroom id is empty', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: 1, 
                classroom_id: "", 
                lecturer_id: 3
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search classes by admin', async () => {
        const res = await requestWithSupertest.post('/classes/searchClasses/')
            .send({
                facility_id: 1, 
                group_id: 1, 
                classroom_id: 1, 
                lecturer_id: 3
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get classes data by facility manager', async () => {
        const res = await requestWithSupertest.post('/classes/getClasses/')
            .send({
                id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get classes data by admin', async () => {
        const res = await requestWithSupertest.post('/classes/getClasses/')
            .send({
                id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('change student presence status by scanning code qr - when user is not student', async () => {
        const res = await requestWithSupertest.post('/classes/changePresenceStatus/')
            .send({
                user_id: 11,
                qr_code: "nbkr",
                gps_x: 1.23456,
                gps_y: 1.23456
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('change student presence status by scanning code qr - when presence_id does not exist', async () => {
        const res = await requestWithSupertest.post('/classes/changePresenceStatus/')
            .send({
                user_id: 1,
                qr_code: "nbkr",
                gps_x: 1.23456,
                gps_y: 1.23456
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(400);
        expect(res.type).toEqual(expect.stringContaining('text/plain'));
    })

    it('change student presence status by scanning code qr - when student is not on time', async () => {
        const res = await requestWithSupertest.post('/classes/changePresenceStatus/')
            .send({
                user_id: 11,
                qr_code: "hyoj",
                gps_x: 51.23532,
                gps_y: 22.55303
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(432);
        expect(res.type).toEqual(expect.stringContaining('text/plain'));
    })

    it('change student presence status by scanning code qr - when student is already present', async () => {
        const res = await requestWithSupertest.post('/classes/changePresenceStatus/')
            .send({
                user_id: 11,
                qr_code: "nbkr",
                gps_x: 1.23456,
                gps_y: 1.23456
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(434);
        expect(res.type).toEqual(expect.stringContaining('text/plain'));
    })

    it('edit classes by facility manager', async () => {
        const res = await requestWithSupertest.post('/classes/editClasses/')
            .send({
                id: 1, 
                classroom_id: 1, 
                lecturer_id: 3
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit classes by admin', async () => {
        const res = await requestWithSupertest.post('/classes/editClasses/')
            .send({
                id: 1, 
                classroom_id: 1, 
                lecturer_id: 3
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search student classes by student', async () => {
        const res = await requestWithSupertest.post('/classes/searchStudentClasses/')
            .send({
                student_id: 11,
                facility_id: 1,
                classroom_id: 11
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('search student classes by admin', async () => {
        const res = await requestWithSupertest.post('/classes/searchStudentClasses/')
            .send({
                student_id: 11,
                facility_id: 1,
                classroom_id: 11
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    server.close()
})