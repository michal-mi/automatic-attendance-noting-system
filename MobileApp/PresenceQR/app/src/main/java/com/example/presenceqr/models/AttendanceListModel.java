package com.example.presenceqr.models;

public class AttendanceListModel {
    private String surname;
    private String name;
    private String id;
    private int attendanceStatus;

    public AttendanceListModel(String surname, String name, String id, int attendanceStatus) {
        this.surname = surname;
        this.attendanceStatus = attendanceStatus;
        this.name = name;
        this.id = id;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(int attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }
}
