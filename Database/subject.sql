create table subject
(
    id           int auto_increment
        primary key,
    facility_id  int                      not null,
    subject_name varchar(70) charset utf8 not null,
    year         int                      not null,
    semester     int                      not null,
    constraint fk_subject_facility
        foreign key (facility_id) references facility (id)
            on update cascade on delete cascade
);

INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (1, 1, 'Matematyka dyskretna', 1, 1);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (2, 1, 'Narzędzia informatyczne', 1, 1);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (3, 1, 'Programowanie strukturalne', 1, 1);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (4, 1, 'Wprowadzenie do informatyki', 1, 1);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (5, 1, 'Podstawy elektrotechniki i elektroniki', 2, 3);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (6, 1, 'Metrologia', 2, 3);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (7, 1, 'Algorytmy analizy numerycznej', 2, 3);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (9, 1, 'Programowanie obiektowe w Java', 2, 3);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (10, 1, 'Systemy wbudowane', 3, 5);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (11, 1, 'Programowanie w języku SWIFT', 3, 5);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (12, 1, 'Zaawansowana inżynieria oprogramowania', 3, 5);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (13, 1, 'Sieci rozproszone', 3, 5);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (14, 1, 'Programowanie aplikacji internetowych', 3, 5);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (15, 1, 'Zaawansowane programowanie w Javie', 4, 7);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (16, 1, 'Projekt zespołowy - implementacja', 4, 7);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (17, 1, 'Seminarium dyplomowe', 4, 7);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (18, 1, 'Procesy wytwarzania oprogramowania', 4, 7);
INSERT INTO `presence-qr`.subject (id, facility_id, subject_name, year, semester) VALUES (19, 1, 'Architektura i programowanie w .NET', 4, 7);
