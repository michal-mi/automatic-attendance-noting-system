package com.example.presenceqr.models;

public class AttendanceModel {
    private String surname;
    private String name;
    private int id;
    private double attendance;

    public AttendanceModel(String surname, String name, int id, double attendance) {
        this.surname = surname;
        this.name = name;
        this.id = id;
        this.attendance = attendance;
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

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public double getAttendance() {
        return attendance;
    }

    public void setAttendance(double attendance) {
        this.attendance = attendance;
    }
}
