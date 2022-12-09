create table classroom
(
    id                    int auto_increment
        primary key,
    facility_id           int           not null,
    classroom_name        varchar(15)   not null,
    QR_code               varchar(10)   not null,
    classroom_description varchar(1000) null,
    gps_x                 decimal(8, 5) not null,
    gps_y                 decimal(8, 5) not null,
    constraint QR_code
        unique (QR_code),
    constraint fk_classroom_facility
        foreign key (facility_id) references facility (id)
            on update cascade on delete cascade
);

INSERT INTO `presence-qr`.classroom (id, facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y) VALUES (1, 1, 'Brak sali', '0000', null, 1.11111, 1.11111);
INSERT INTO `presence-qr`.classroom (id, facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y) VALUES (2, 1, 'PE123', '27ug', 'W budynku Pentagon', 22.55316, 51.23503);
INSERT INTO `presence-qr`.classroom (id, facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y) VALUES (3, 1, 'CI403C', '4h2j', 'W budynku Rdzewiak', 22.55106, 51.23602);
INSERT INTO `presence-qr`.classroom (id, facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y) VALUES (4, 1, 'CT202', '93g4', 'W budynku CEN-TECH', 22.54851, 51.23633);
