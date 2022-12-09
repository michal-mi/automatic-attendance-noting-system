create table role
(
    id        int         not null
        primary key,
    role_name varchar(45) not null,
    constraint role_name
        unique (role_name)
);

INSERT INTO `presence-qr`.role (id, role_name) VALUES (1, 'admin');
INSERT INTO `presence-qr`.role (id, role_name) VALUES (2, 'facility_manager');
INSERT INTO `presence-qr`.role (id, role_name) VALUES (3, 'lecturer');
INSERT INTO `presence-qr`.role (id, role_name) VALUES (4, 'student');
