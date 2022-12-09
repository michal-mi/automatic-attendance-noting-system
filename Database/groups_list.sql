create table groups_list
(
    id          int auto_increment
        primary key,
    facility_id int                      not null,
    group_name  varchar(25) charset utf8 not null,
    year        int                      not null,
    semester    int                      not null,
    constraint fk_group_facility
        foreign key (facility_id) references facility (id)
            on update cascade on delete cascade
);

INSERT INTO `presence-qr`.groups_list (id, facility_id, group_name, year, semester) VALUES (1, 1, 'I1S 1.1', 1, 1);
INSERT INTO `presence-qr`.groups_list (id, facility_id, group_name, year, semester) VALUES (2, 1, 'I1S 3.1', 2, 3);
INSERT INTO `presence-qr`.groups_list (id, facility_id, group_name, year, semester) VALUES (3, 1, 'IO 5.1', 3, 5);
INSERT INTO `presence-qr`.groups_list (id, facility_id, group_name, year, semester) VALUES (4, 1, 'IO 7.1', 4, 7);
