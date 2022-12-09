create table student_group
(
    id         int auto_increment
        primary key,
    group_id   int not null,
    student_id int not null,
    constraint fk_student_group_group
        foreign key (group_id) references groups_list (id)
            on update cascade on delete cascade,
    constraint fk_student_group_student
        foreign key (student_id) references user (id)
            on update cascade on delete cascade
);

INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (1, 4, 11);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (2, 4, 12);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (3, 4, 13);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (4, 4, 14);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (5, 4, 16);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (6, 4, 15);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (7, 3, 17);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (8, 3, 18);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (9, 3, 19);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (10, 3, 20);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (11, 3, 21);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (12, 2, 23);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (13, 2, 24);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (14, 2, 25);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (15, 2, 26);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (16, 2, 27);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (17, 2, 28);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (18, 1, 29);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (19, 1, 30);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (20, 1, 31);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (21, 1, 32);
INSERT INTO `presence-qr`.student_group (id, group_id, student_id) VALUES (22, 1, 40);
