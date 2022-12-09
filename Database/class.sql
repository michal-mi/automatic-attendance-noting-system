create table class
(
    id             int auto_increment
        primary key,
    classroom_id   int  null,
    subject_id     int  not null,
    lecturer_id    int  null,
    group_id       int  not null,
    beginning_time time not null,
    ending_time    time not null,
    day_of_week    int  not null,
    beginning_date date not null,
    end_date       date not null,
    constraint fk_class_classroom
        foreign key (classroom_id) references classroom (id)
            on update cascade,
    constraint fk_class_group
        foreign key (group_id) references groups_list (id)
            on update cascade on delete cascade,
    constraint fk_class_lecturer
        foreign key (lecturer_id) references user (id)
            on update cascade,
    constraint fk_class_subject
        foreign key (subject_id) references subject (id)
            on update cascade on delete cascade
);

INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (1, 2, 16, 4, 4, '14:33:00', '16:00:00', 2, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (2, 3, 19, 9, 4, '10:30:00', '12:45:00', 4, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (3, 4, 17, 10, 4, '14:15:00', '16:30:00', 4, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (4, 4, 15, 8, 4, '15:30:00', '17:45:00', 5, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (5, 3, 18, 5, 4, '15:45:00', '18:00:00', 3, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (6, 2, 13, 6, 3, '08:15:00', '10:00:00', 3, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (7, 3, 10, 3, 3, '10:15:00', '12:00:00', 3, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (8, 2, 12, 6, 3, '14:15:00', '16:00:00', 1, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (9, 2, 11, 9, 3, '18:15:00', '20:00:00', 1, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (10, 2, 14, 8, 3, '12:15:00', '14:00:00', 3, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (11, 3, 5, 5, 2, '10:15:00', '12:00:00', 1, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (12, 4, 7, 6, 2, '10:30:00', '12:00:00', 2, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (13, 3, 6, 7, 2, '12:15:00', '14:00:00', 2, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (14, 2, 9, 3, 2, '10:15:00', '11:45:00', 4, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (15, 2, 1, 4, 1, '08:15:00', '10:00:00', 2, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (16, 4, 2, 10, 1, '18:15:00', '20:00:00', 2, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (17, 2, 4, 5, 1, '13:45:00', '15:15:00', 5, '2022-11-29', '2023-02-02');
INSERT INTO `presence-qr`.class (id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) VALUES (18, 3, 3, 5, 1, '16:15:00', '18:00:00', 2, '2022-11-29', '2023-02-02');
