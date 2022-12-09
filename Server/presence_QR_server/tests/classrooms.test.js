const server = require('../index.js');
const supertest = require('supertest');
const classroom = require("../models/classroom.js")
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');
const fs = require('fs');

describe('Classrooms Endpoints', () => {

  const tokenManager = jwt.sign({ user_role: 2 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
  const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

  var text = fs.readFileSync('./tests/dataForTesting/addClassroomsTest.json', 'utf8')
  var dataAdd = JSON.parse(text)

  test.each(dataAdd)('add one classroom', async (item) => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send(item)
      .set('Authorization', tokenManager);
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  var text = fs.readFileSync('./tests/dataForTesting/getOneClassroomTest.json', 'utf8')
  var dataGet = JSON.parse(text)

  test.each(dataGet)('get one classroom', async (item) => {
    const res = await requestWithSupertest.post('/classrooms/getOneClassroom/')
      .send(item)
      .set('Authorization', tokenManager);

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
    expect(res.body[0].QR_code).toHaveLength(4)
  })

  var text = fs.readFileSync('./tests/dataForTesting/deleteOneClassroomTest.json', 'utf8')
  var dataDelete = JSON.parse(text)

  test.each(dataDelete)('delete one classroom', async (item) => {
    const res = await requestWithSupertest.post('/classrooms/deleteOneClassroom/')
      .send(item)
      .set('Authorization', tokenManager);
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining(""));
  })

  it('get all classrooms by facility manager', async () => {
    const res = await requestWithSupertest.get('/classrooms/getAllClassrooms/')
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('get all classrooms by admin', async () => {
    const res = await requestWithSupertest.get('/classrooms/getAllClassrooms/')
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('get all classrooms from facility by facility manager', async () => {
    const res = await requestWithSupertest.post('/classrooms/getAllClassroomsNamesFromFacility/')
      .send({
        facility_id: 1
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('get all classrooms from facility by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/getAllClassroomsNamesFromFacility/')
      .send({
        facility_id: 1
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('create classroom by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "kfarrother0",
        facility_id: 1,
        classroom_description: "",
        gps_x: 14.37282,
        gps_y: 63.31307
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('create classroom by facility manager - invalid classroom name', async () => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "",
        facility_id: 1,
        classroom_description: "",
        gps_x: 14.37282,
        gps_y: 63.31307
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('create classroom by facility manager - invalid facility_id', async () => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "kfarrother0",
        facility_id: "",
        classroom_description: "",
        gps_x: 14.37282,
        gps_y: 63.31307
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('create classroom by facility manager - invalid classroom description', async () => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "kfarrother0",
        facility_id: 1,
        classroom_description: "fVWNeBhZITnYgi2o1h9hKwVSWjmbGxwN85DGw0fOF0kUvtN6bl3wJnamggL1W3n29vcQ3zJBYhLbOxAHS1sQCjpgw8nHLqYMcHzi9ifhnpNCtHIyjJtNlzToofpHmRCTICcvcOtFd7bhxm0oCDJFjuBDfJ7h8nwAvbxdg1Y2gmMIxL0ufQYd8NvPbBZktxNhY6FTzrNSvJ0VQDaRElgma0HpgDyluOHjyh5uGp2NXtf8uXKkJXBPpZSgSNPNbgtqzoTHuxtiwxpvyMzLt7GEzrNp8aaiFeGE2ydYPTqx7cO8fgCg9bNSYY3V0h7w9CgUcd28lp7h9D89776lJKPiUboxVYn28FJowPvX8drGpOsWPisDfexNp9XelftKenFv0mUOEakfreOow4MVCuekPnKx4HszGMtHzLBvBTpmPoQ1EMOCNQKOGUU3QbCOMIIWOODQPya2BOulHLTLEZiQmxKJMqmZKfI0F4vGRoEOgiBZeK5Z8ynZUe3T95ZqAsU6m2NKFLWJcsjwgshna9vngl0XjiZ2sRfmDWEYKv3LjvzHeEAKLYAopXbHrFQBDWLyqinRmVk6idj3Uk3yAHWJ1vrCR525rteu67fyxzfaTX8CSal31ogAU9pTU384EW8N1GV96Fvy9UBfXNQxC6w5qN2XVRHzUqTVUCTUAVnVMzTISnx8AgUdjhApShL6iPqVUMqQ29HyXSrx9DMoMtQyt3vGjLMioKVZzn8tiAdNGAoVgCPy3tx7gvPplCQLhDAdP4dU15EB2iICvmuQLIWCnhXXMK0tlgC95vs19C52LhhB8obeYcM9bHsFrjqV9xyTinohYt4d4sl64ABcy9xxEpLJsP4sAj1JaTU0cbwASmQdWdvMjzf5tvLAoPMYyf7goV9LTniQvbDsw1iQfahAC7rWKDCjIKqK4BrfLWMXDrRuzWCHFp0eV9w7X37c7KU2ix8bhaVhrLWJj2SpyoGT4bBI40484mR8mzXNzBibs",
        gps_x: 14.37282,
        gps_y: 63.31307
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('create classroom by facility manager - invalid gps_x', async () => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "kfarrother0",
        facility_id: 1,
        classroom_description: "",
        gps_x: 14.3728,
        gps_y: 63.31307
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('create classroom by facility manager - invalid gps_y', async () => {
    const res = await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "kfarrother0",
        facility_id: 1,
        classroom_description: "",
        gps_x: 14.37282,
        gps_y: 63.3130
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('get all classroom from facility by facility manager', async () => {
    const res = await requestWithSupertest.post('/classrooms/getAllClassroomsFromFacility/')
      .send({
        facility_id: 1
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('get all classroom from facility by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/getAllClassroomsFromFacility/')
      .send({
        facility_id: 1
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('get one classroom by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/getOneClassroom/')
      .send({
        facility_id: 1,
        id: 1
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: 1,
        classroom_description: "",
        gps_x: 22.54893,
        gps_y: 51.23682
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by facility manager - invalid classroom name', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "",
        facility_id: 1,
        classroom_description: "",
        gps_x: 22.54893,
        gps_y: 51.23682
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by facility manager - invalid facility_id', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: "",
        classroom_description: "",
        gps_x: 22.54893,
        gps_y: 51.23682
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by facility manager - invalid classroom description', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: 1,
        classroom_description: "fVWNeBhZITnYgi2o1h9hKwVSWjmbGxwN85DGw0fOF0kUvtN6bl3wJnamggL1W3n29vcQ3zJBYhLbOxAHS1sQCjpgw8nHLqYMcHzi9ifhnpNCtHIyjJtNlzToofpHmRCTICcvcOtFd7bhxm0oCDJFjuBDfJ7h8nwAvbxdg1Y2gmMIxL0ufQYd8NvPbBZktxNhY6FTzrNSvJ0VQDaRElgma0HpgDyluOHjyh5uGp2NXtf8uXKkJXBPpZSgSNPNbgtqzoTHuxtiwxpvyMzLt7GEzrNp8aaiFeGE2ydYPTqx7cO8fgCg9bNSYY3V0h7w9CgUcd28lp7h9D89776lJKPiUboxVYn28FJowPvX8drGpOsWPisDfexNp9XelftKenFv0mUOEakfreOow4MVCuekPnKx4HszGMtHzLBvBTpmPoQ1EMOCNQKOGUU3QbCOMIIWOODQPya2BOulHLTLEZiQmxKJMqmZKfI0F4vGRoEOgiBZeK5Z8ynZUe3T95ZqAsU6m2NKFLWJcsjwgshna9vngl0XjiZ2sRfmDWEYKv3LjvzHeEAKLYAopXbHrFQBDWLyqinRmVk6idj3Uk3yAHWJ1vrCR525rteu67fyxzfaTX8CSal31ogAU9pTU384EW8N1GV96Fvy9UBfXNQxC6w5qN2XVRHzUqTVUCTUAVnVMzTISnx8AgUdjhApShL6iPqVUMqQ29HyXSrx9DMoMtQyt3vGjLMioKVZzn8tiAdNGAoVgCPy3tx7gvPplCQLhDAdP4dU15EB2iICvmuQLIWCnhXXMK0tlgC95vs19C52LhhB8obeYcM9bHsFrjqV9xyTinohYt4d4sl64ABcy9xxEpLJsP4sAj1JaTU0cbwASmQdWdvMjzf5tvLAoPMYyf7goV9LTniQvbDsw1iQfahAC7rWKDCjIKqK4BrfLWMXDrRuzWCHFp0eV9w7X37c7KU2ix8bhaVhrLWJj2SpyoGT4bBI40484mR8mzXNzBibs",
        gps_x: 22.54893,
        gps_y: 51.23682
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by facility manager - invalid gps_x', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: 1,
        classroom_description: "",
        gps_x: 22.5489,
        gps_y: 51.23682
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by facility manager - invalid gps_y', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: 1,
        classroom_description: "",
        gps_x: 22.54893,
        gps_y: 51.2368
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(403);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('update classroom by facility manager', async () => {
    const res = await requestWithSupertest.post('/classrooms/updateOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: 1,
        classroom_description: "",
        gps_x: 22.54893,
        gps_y: 51.23682
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining(''));
  })

  it('delete classroom cascade by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/deleteOneClassroom/')
      .send({
        id: 1,
        classroom_name: "E100",
        facility_id: 1,
        classroom_description: "",
        gps_x: 22.54893,
        gps_y: 51.23682
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('delete classroom by facility manager', async () => {
    await requestWithSupertest.post('/classrooms/createClassroom/')
      .send({
        id: 501,
        classroom_name: "kfarrother0",
        facility_id: "",
        classroom_description: "",
        gps_x: 14.37282,
        gps_y: 63.31307
      })
      .set('Authorization', tokenManager)

    const res = await requestWithSupertest.post('/classrooms/deleteOneClassroomNoCascade/')
      .send({
        id: 501
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('delete classroom by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/deleteOneClassroomNoCascade/')
      .send({
        id: 501
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })

  it('get all classrooms schedule for facility on specific days by facility manager', async () => {
    const res = await requestWithSupertest.post('/classrooms/classroomsScheduleForFacilityOnSpecificDays/')
      .send({
        facility_id: 1, 
        days: ["2022-03-02","2022-03-03"]
      })
      .set('Authorization', tokenManager)

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
  })

  it('get all classrooms schedule for facility on specific days by admin', async () => {
    const res = await requestWithSupertest.post('/classrooms/classroomsScheduleForFacilityOnSpecificDays/')
      .send({
        facility_id: 1, 
        days: ["2022-03-02","2022-03-03"]
      })
      .set('Authorization', tokenAdmin)

    expect(res.status).toEqual(401);
    expect(res.type).toEqual(expect.stringContaining('text/html'));
  })


  server.close()
})




