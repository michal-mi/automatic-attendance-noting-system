const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');

describe('Days Endpoints', () => {
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenStudent = jwt.sign({ user_role: 4 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenManager = jwt.sign({ user_role: 2 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    it('get facility data by id by facility manager', async () => {
      const res = await requestWithSupertest.post('/days/getCalendarForFacility/')
        .send({
          facility_id: 1
        })
        .set('Authorization', tokenManager)

      expect(res.status).toEqual(200);
      expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get facility data by id by admin', async () => {
      const res = await requestWithSupertest.post('/days/getCalendarForFacility/')
        .send({
          facility_id: 1
        })
        .set('Authorization', tokenAdmin)

      expect(res.status).toEqual(401);
      expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit calendar by facility manager', async () => {
        const res = await requestWithSupertest.post('/days/editCalendar/')
            .send({
                to_change: [{
                    id: 1,
                    is_free: 0
                }]
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit calendar by admin', async () => {
        const res = await requestWithSupertest.post('/days/editCalendar/')
            .send({
                to_change: [{
                    id: 1,
                    is_free: 0
                }]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('add days by facility manager', async () => {
        const res = await requestWithSupertest.post('/days/addDays/')
            .send({
                facility_id: 2, 
                start_day: "2022-01-01", 
                end_day: "2022-01-01", 
                days_off: []
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('add days by admin', async () => {
        const res = await requestWithSupertest.post('/days/addDays/')
            .send({
                facility_id: 2, 
                start_day: "2022-01-01", 
                end_day: "2022-01-01", 
                days_off: []
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get whole calendar for facility by facility manager', async () => {
        const res = await requestWithSupertest.post('/days/getWholeCalendarForFacility/')
            .send({
                facility_id: 1 
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('json'));
    })

    it('get whole calendar for facility by admin', async () => {
        const res = await requestWithSupertest.post('/days/getWholeCalendarForFacility/')
            .send({
                facility_id: 1 
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    server.close()
})