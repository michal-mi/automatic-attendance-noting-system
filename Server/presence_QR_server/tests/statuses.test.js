const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');

describe('Statuses Endpoint', () => {

    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    it('get all statuses by lecturer', async () => {
        const res = await requestWithSupertest.get('/statuses/getStatusesList/')
            .set('Authorization', tokenLecturer);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all statuses by admin', async () => {
        const res = await requestWithSupertest.get('/statuses/getStatusesList/')
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    server.close()
})
