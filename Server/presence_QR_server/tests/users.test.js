const server = require('../index.js');
const supertest = require('supertest');
const requestWithSupertest = supertest(server);
const jwt = require('jsonwebtoken');
const fs = require('fs');

describe('Users Endpoints', () => {
    const tokenLecturer = jwt.sign({ user_role: 3 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenAdmin = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenManager = jwt.sign({ user_role: 2 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
    const tokenStudent = jwt.sign({ user_role: 4 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });

    var text = fs.readFileSync('./tests/dataForTesting/sendLinkTest.json', 'utf8')
    var dataSendLink = JSON.parse(text)

    test.each(dataSendLink)('send link to user to change password', async (item) => {
        const res = await requestWithSupertest.post('/users/initiatePasswordChange/')
            .send(item);
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
        await new Promise((r) => setTimeout(r, 1000));
    })
    server.close()

    var text = fs.readFileSync('./tests/dataForTesting/setUserDataToExport.json', 'utf8')
    var dataExport = JSON.parse(text)

    test.each(dataExport)('set users data to export', async (item) => {
        const token = jwt.sign({ user_role: 1 }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
        const res = await requestWithSupertest.post('/users/getManyUsersDataByID/')
            .send(item)
            .set('Authorization', token);
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all users by admin', async () => {
        const res = await requestWithSupertest.get('/users/allUsers/')
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get all users by lecturer', async () => {
        const res = await requestWithSupertest.get('/users/allUsers/')
            .set('Authorization', tokenLecturer);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get one user by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/oneUserDataByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get one user by id by student', async () => {
        const res = await requestWithSupertest.post('/users/oneUserDataByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenStudent);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get one user data with group by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/oneUserDataByIDForEditing/')
            .send({
                id: 3
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get one user data with group by id by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/oneUserDataByIDForEditing/')
            .send({
                id: 3
            })
            .set('Authorization', tokenLecturer);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get one hashed password by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/oneUserPasswordByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('get one hashed password by id by student', async () => {
        const res = await requestWithSupertest.post('/users/oneUserPasswordByID/')
            .send({
                id: 3
            })
            .set('Authorization', tokenStudent);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('change user hashed password by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/changeOneUserPasswordByID/')
            .send({
                id: 32,
                oldPassword: "$2a$12$aA88Xt5QVMEa3D83KnpgMeIoxlHB/pWTWuAw/x8R5sbPt4JoC97ea",
                newPassword: "$2a$12$aA88Xt5QVMEa3D83KnpgMeIoxlHB/pWTWuAw/x8R5sbPt4JoC97ea"
            })
            .set('Authorization', tokenAdmin);

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('change user hashed password by id by student', async () => {
        const res = await requestWithSupertest.post('/users/changeOneUserPasswordByID/')
            .send({
                id: 32,
                oldPassword: "$2a$12$aA88Xt5QVMEa3D83KnpgMeIoxlHB/pWTWuAw/x8R5sbPt4JoC97ea",
                newPassword: "$2a$12$aA88Xt5QVMEa3D83KnpgMeIoxlHB/pWTWuAw/x8R5sbPt4JoC97ea"
            })
            .set('Authorization', tokenStudent);

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('change user avatar reference by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/changeOneUserAvatarReferenceByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('change user avatar reference by id by student', async () => {
        const res = await requestWithSupertest.post('/users/changeOneUserAvatarReferenceByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('upload user avatar by id by student', async () => {
        const res = await requestWithSupertest.post('/users/changeOneUserAvatarByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('Delete user avatar reference by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/deleteOneUserAvatarReferenceByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('Delete user avatar reference by id by student', async () => {
        const res = await requestWithSupertest.post('/users/deleteOneUserAvatarReferenceByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('Delete user avatar by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/deleteOneUserAvatarByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('Delete user avatar by id by student', async () => {
        const res = await requestWithSupertest.post('/users/deleteOneUserAvatarByID/')
            .send({
                id: 39
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('check if link is active by student', async () => {
        const res = await requestWithSupertest.post('/users/checkLink/')
            .send({
                user_id: 32,
                change_pswd_link: "link"
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('change user password from link by student', async () => {
        const res = await requestWithSupertest.post('/users/newPasswordRecovery/')
            .send({
                user_id: 32, 
                password: "nowehaslo*93", 
                change_pswd_link: "link"
            })
            .set('Authorization', tokenStudent)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining('application/json'));
    })

    it('create user by admin', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 2, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadadsadassgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('create user by admin with role id 4', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 4, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadadsadassgud@dasgdsa.pl", 
                title:"", 
                birth_date:"2000-12-12", 
                group_id: ["1"]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('create user by admin - invalid first name', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 2, 
                first_name: "", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - invalid second name', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 2, 
                first_name: "Test", 
                second_name: "dasdas", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - invalid surname', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 2, 
                first_name: "Test", 
                second_name: "", 
                surname: "", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - invalid e-mail', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 2, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - facility id is empty', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: "", 
                role_id: 2, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - facility id is undefined', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: undefined, 
                role_id: 2, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - role id is empty', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: "", 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - role id is undefined', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: undefined, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - invalid lecturer title', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 3, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create user by admin - invalid birth date', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 4, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('create user by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/createUser/')
            .send({
                facility_id: 1, 
                role_id: 2, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"dsadsadsadasgud@dasgdsa.pl", 
                title:"", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('create users by admin', async () => {
        const res = await requestWithSupertest.post('/users/createUsers/')
            .send([{
                facility_id: 1,
                role_id: 2,
                first_name: "Test",
                second_name: "",
                surname: "Test",
                e_mail: "maciekn123@o2.pl",
                title: "",
                birth_date: "",
                group_id: ""
            }])
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
        await new Promise((r) => setTimeout(r, 1000));
    })

    it('create users by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/createUsers/')
            .send([{
                facility_id: 1,
                role_id: 2,
                first_name: "Test",
                second_name: "",
                surname: "Test",
                e_mail: "dsadsadsadasgud@dasgdsa.pl",
                title: "",
                birth_date: "",
                group_id: ""
            }])
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search users for users list view by admin', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2, 
                id: "", 
                user_surname: "", 
                user_facility: "", 
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('search users for users list view by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2, 
                id: "", 
                user_surname: "", 
                user_facility: "", 
                user_group: ""
            }])
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('search users for facility managers by admin using role only', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "",
                user_surname: "",
                user_facility: "",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role and id', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "2",
                user_surname: "",
                user_facility: "",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role, id and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "2",
                user_surname: "Stefańska",
                user_facility: "",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role, id, surname and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "2",
                user_surname: "Stefańska",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role, id and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "2",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "",
                user_surname: "Stefańska",
                user_facility: "",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for facility managers by admin using role surname and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 2,
                id: "",
                user_surname: "Stefańska",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    
    it('search users for lecturers by admin using role only', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 3,
                id: "",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for lecturers by admin using role, id and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 3,
                id: "3",
                user_surname: "Kozioł",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for lecturers by admin using role and id', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 3,
                id: "3",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for lecturers by admin using role and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 3,
                id: "",
                user_surname: "Kozieł",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    
    it('search users for students by admin using role only', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role and id', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "11",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, id and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "11",
                user_surname: "Nawrocka",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, id, surname and group', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "11",
                user_surname: "Nawrocka",
                user_facility: "1",
                user_group: "15"
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, id and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "11",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "Nawrocka",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, surname and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "Nawrocka",
                user_facility: "1",
                user_group: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    
    
    
    
    
    
    it('search users for students by admin using role and facility', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "",
                user_facility: "1",
                user_group: "",
                birth_year: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, facility and id', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 4,
                id: "11",
                user_surname: "",
                user_facility: "1",
                user_group: "",
                birth_year: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, facility, surname and birth year', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "Nawrocka",
                user_facility: "1",
                user_group: "",
                birth_year: "2002"
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, facility and birth year', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "",
                user_facility: "1",
                user_group: "",
                birth_year: "2002"
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for students by admin using role, facility and surname', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 4,
                id: "",
                user_surname: "Nawrocka",
                user_facility: "1",
                user_group: "",
                birth_year: ""
            }])
            .set('Authorization', tokenAdmin)
    
        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })
    
    it('search users for assign user to group view by facility manager', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 2, 
                facility_id: 1,
                id: "", 
                user_surname: "",
                birth_year: ""
            }])
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('search users for assign user to group view by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/searchUsers2/')
            .send([{
                user_role: 2, 
                id: "", 
                user_surname: "", 
                user_facility: "", 
                user_group: ""
            }])
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
        await new Promise((r) => setTimeout(r, 1000));
    })

    it('edit user by admin - invalid first name', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 2, 
                first_name: "", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - invalid second name', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "gdffdg", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - second name is undefined', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 30,
                facility_id: 1, 
                role_id: 4, 
                first_name: "Hubert", 
                second_name: undefined, 
                surname: "Rogowski", 
                e_mail:"hubert.rogowski@pollub.edu.pl", 
                title: "", 
                birth_date: "2001-01-16", 
                group_id: ["8"]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit user by admin - group id is not change', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 30,
                facility_id: 1, 
                role_id: 4, 
                first_name: "Hubert", 
                second_name: "", 
                surname: "Rogowski", 
                e_mail:"hubert.rogowski@pollub.edu.pl", 
                title: "", 
                birth_date: "2001-01-16", 
                group_id: ["8"]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit user by admin - group id is not change', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 30,
                facility_id: 1, 
                role_id: 4, 
                first_name: "Hubert", 
                second_name: "", 
                surname: "Rogowski", 
                e_mail:"hubert.rogowski@pollub.edu.pl", 
                title: "", 
                birth_date: "2001-01-16", 
                group_id: ["9"]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit user by admin - student to lecturer', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 15,
                facility_id: 1, 
                role_id: 3, 
                first_name: "Gabriel", 
                second_name: "", 
                surname: "Kowalski", 
                e_mail:"gabriel.kowalski@pollub.edu.pl", 
                title: "dr", 
                birth_date: "", 
                group_id: []
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit user by admin - lecturer to student', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 15,
                facility_id: 1, 
                role_id: 4, 
                first_name: "Gabriel", 
                second_name: "", 
                surname: "Kowalski", 
                e_mail:"gabriel.kowalski@pollub.edu.pl", 
                title: "", 
                birth_date: "1999-12-20", 
                group_id: []
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit user by admin - invalid surname', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - invalid e-mail', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - facility id is empty', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: "", 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - facility id is undefined', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: undefined, 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - role id is empty', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: "", 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - role id is undefined', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: undefined, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - invalid lecturer title', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 3, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('edit user by admin - invalid birth date', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 4, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(403);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('edit user by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/editUser/')
            .send({
                id: 39,
                facility_id: 1, 
                role_id: 2, 
                first_name: "Maciej", 
                second_name: "", 
                surname: "Nawrot", 
                e_mail:"maciej.nawrot@pollub.edu.pl", 
                title: "", 
                birth_date: "", 
                group_id: ""
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete user by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/deleteUser/')
            .send({
                id: 60,
                role_id: 2
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('create and delete user by id by admin', async () => {
        await requestWithSupertest.post('/users/createUser/')
            .send({
                id: 300,
                facility_id: 1, 
                role_id: 3, 
                first_name: "Test", 
                second_name: "", 
                surname: "Test", 
                e_mail:"adadsadassgusdsaasd@dasgdsa.pl", 
                title:"dr", 
                birth_date:"", 
                group_id:""
            })
            .set('Authorization', tokenAdmin)

        const res = await requestWithSupertest.post('/users/deleteUser/')
            .send({
                id: 300,
                role_id: 3
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete user by id by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/deleteUser/')
            .send({
                id: 60,
                role_id: 2
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('delete user from group by id by facility manager', async () => {
        const res = await requestWithSupertest.post('/users/deleteUserFromGroup/')
            .send({
                id: 60,
                group_id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('delete user from group by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/deleteUserFromGroup/')
            .send({
                id: 60,
                group_id: 1
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get many users data by id by admin', async () => {
        const res = await requestWithSupertest.post('/users/getManyUsersDataByID/')
            .send({
                id_array: [2]
            })
            .set('Authorization', tokenAdmin)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('get many users data by id by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/getManyUsersDataByID/')
            .send({
                id_array: [2]
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all students from group by facility manager', async () => {
        const res = await requestWithSupertest.post('/users/getAllStudentsFromGroup/')
            .send({
                id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('get all students from group by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/getAllStudentsFromGroup/')
            .send({
                id: 1
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all students from facility by facility manager', async () => {
        const res = await requestWithSupertest.post('/users/getAllStudentsFromFacility/')
            .send({
                id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('get all students from facility by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/getAllStudentsFromFacility/')
            .send({
                id: 1
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all lecturers from facility by facility manager', async () => {
        const res = await requestWithSupertest.post('/users/getAllLecturersFromFacility/')
            .send({
                id: 1
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('get all lecturers from facility by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/getAllLecturersFromFacility/')
            .send({
                id: 1
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all lecturers schedule from facility on specific day by facility manager', async () => {
        const res = await requestWithSupertest.post('/users/lecturerScheduleForFacilityOnSpecificDays/')
            .send({
                facility_id: 1, 
                days: ["2022-03-02"]
            })
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('get all lecturers schedule from facility on specific day by lecturer', async () => {
        const res = await requestWithSupertest.post('/users/lecturerScheduleForFacilityOnSpecificDays/')
            .send({
                facility_id: 1, 
                days: ["2022-03-02"]
            })
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    it('get all e-mails by admin', async () => {
        const res = await requestWithSupertest.get('/users/getAllEmails/')
            .set('Authorization', tokenManager)

        expect(res.status).toEqual(200);
        expect(res.type).toEqual(expect.stringContaining(''));
    })

    it('get all e-mails by lecturer', async () => {
        const res = await requestWithSupertest.get('/users/getAllEmails/')
            .set('Authorization', tokenLecturer)

        expect(res.status).toEqual(401);
        expect(res.type).toEqual(expect.stringContaining('text/html'));
    })

    server.close()
})

