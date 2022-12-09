create table status
(
    id          int                     not null
        primary key,
    status_name varchar(9) charset utf8 not null,
    constraint status_name
        unique (status_name)
);

INSERT INTO `presence-qr`.status (id, status_name) VALUES (1, 'absent');
INSERT INTO `presence-qr`.status (id, status_name) VALUES (4, 'exempt');
INSERT INTO `presence-qr`.status (id, status_name) VALUES (3, 'justified');
INSERT INTO `presence-qr`.status (id, status_name) VALUES (2, 'present');
