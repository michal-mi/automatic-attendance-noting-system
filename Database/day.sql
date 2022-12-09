create table day
(
    id          int auto_increment
        primary key,
    facility_id int     not null,
    date        date    not null,
    is_free     tinyint not null,
    constraint fk_day_facility
        foreign key (facility_id) references facility (id)
            on update cascade on delete cascade
);

INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (1, 1, '2022-11-29', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (2, 1, '2022-11-30', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (3, 1, '2022-12-01', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (4, 1, '2022-12-02', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (5, 1, '2022-12-03', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (6, 1, '2022-12-04', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (7, 1, '2022-12-05', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (8, 1, '2022-12-06', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (9, 1, '2022-12-07', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (10, 1, '2022-12-08', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (11, 1, '2022-12-09', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (12, 1, '2022-12-10', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (13, 1, '2022-12-11', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (14, 1, '2022-12-12', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (15, 1, '2022-12-13', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (16, 1, '2022-12-14', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (17, 1, '2022-12-15', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (18, 1, '2022-12-16', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (19, 1, '2022-12-17', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (20, 1, '2022-12-18', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (21, 1, '2022-12-19', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (22, 1, '2022-12-20', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (23, 1, '2022-12-21', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (24, 1, '2022-12-22', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (25, 1, '2022-12-23', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (26, 1, '2022-12-24', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (27, 1, '2022-12-25', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (28, 1, '2022-12-26', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (29, 1, '2022-12-27', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (30, 1, '2022-12-28', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (31, 1, '2022-12-29', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (32, 1, '2022-12-30', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (33, 1, '2022-12-31', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (34, 1, '2023-01-01', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (35, 1, '2023-01-02', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (36, 1, '2023-01-03', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (37, 1, '2023-01-04', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (38, 1, '2023-01-05', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (39, 1, '2023-01-06', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (40, 1, '2023-01-07', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (41, 1, '2023-01-08', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (42, 1, '2023-01-09', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (43, 1, '2023-01-10', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (44, 1, '2023-01-11', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (45, 1, '2023-01-12', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (46, 1, '2023-01-13', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (47, 1, '2023-01-14', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (48, 1, '2023-01-15', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (49, 1, '2023-01-16', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (50, 1, '2023-01-17', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (51, 1, '2023-01-18', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (52, 1, '2023-01-19', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (53, 1, '2023-01-20', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (54, 1, '2023-01-21', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (55, 1, '2023-01-22', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (56, 1, '2023-01-23', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (57, 1, '2023-01-24', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (58, 1, '2023-01-25', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (59, 1, '2023-01-26', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (60, 1, '2023-01-27', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (61, 1, '2023-01-28', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (62, 1, '2023-01-29', 1);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (63, 1, '2023-01-30', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (64, 1, '2023-01-31', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (65, 1, '2023-02-01', 0);
INSERT INTO `presence-qr`.day (id, facility_id, date, is_free) VALUES (66, 1, '2023-02-02', 0);
