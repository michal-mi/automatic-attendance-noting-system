package com.example.presenceqr.models;

public class ClassInfoModel {
    private int classId;
    private String group;
    private String classroom;
    private String subject;

    public ClassInfoModel(int classId, String group, String classroom, String subject) {
        this.classId = classId;
        this.group = group;
        this.classroom = classroom;
        this.subject = subject;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public String getClassroom() {
        return classroom;
    }

    public void setClassroom(String classroom) {
        this.classroom = classroom;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}
