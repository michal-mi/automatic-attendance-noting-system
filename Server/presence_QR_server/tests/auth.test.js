const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const fs = require('fs');

describe('Auth Endpoints', () => {

  var text = fs.readFileSync('./tests/dataForTesting/authTest.json', 'utf8')
  var data = JSON.parse(text)

  test.each(data)('login users to web app with valid data', async (item) => {

    const res = await requestWithSupertest.post('/auth/')
      .send(item);

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));

  })

  it('login user to web app with empty data', async () => {
    const res = await requestWithSupertest.post('/auth/')
      .send({
        email: "",
        password: ""
      })

    expect(res.status).toEqual(400);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('login user to web app with invalid email', async () => {
    const res = await requestWithSupertest.post('/auth/')
      .send({
        email: "abc@abc.com",
        password: "#Haslo123#"
      })

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('login user to web app with invalid password', async () => {
    const res = await requestWithSupertest.post('/auth/')
      .send({
        email: "urszula.stefanska@pollub.pl",
        password: "#Haslo123"
      })

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('login user to mobile app with empty data', async () => {
    const res = await requestWithSupertest.post('/auth/android/')
      .send({
        email: "",
        password: ""
      })

    expect(res.status).toEqual(400);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('login user to mobile app with invalid e-mail', async () => {
    const res = await requestWithSupertest.post('/auth/android/')
      .send({
        email: "abc@abc.com",
        password: "#Haslo123#"
      })

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('login user to mobile app with invalid password', async () => {
    const res = await requestWithSupertest.post('/auth/android/')
      .send({
        email: "gabriela.nawrocka@pollub.edu.pl",
        password: "^somePasswd4321"
      })

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('login user to mobile app with valid data', async () => {
    const res = await requestWithSupertest.post('/auth/android/')
      .send({
        email: "gabriela.nawrocka@pollub.edu.pl",
        password: "^somePasswd4321^"
      })

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  server.close()
})
