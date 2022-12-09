create table facility
(
    id              int auto_increment
        primary key,
    facility_name   varchar(70) charset utf8 not null,
    facility_status tinyint                  not null,
    facility_logo   varchar(10)              null,
    constraint facility_name
        unique (facility_name)
);

INSERT INTO `presence-qr`.facility (id, facility_name, facility_status, facility_logo) VALUES (1, 'Politechnika Lubelska', 1, '1');
