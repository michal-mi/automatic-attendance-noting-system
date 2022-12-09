package com.example.presenceqr.models;

public class LecturerPresenceModel {
    private String subject;
    private int subjectId;
    private String group;
    private int groupId;
    public LecturerPresenceModel(String subject, int subjectId, String group, int groupId) {
        this.subject = subject;
        this.subjectId = subjectId;
        this.group = group;
        this.groupId = groupId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public int getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(int subjectId) {
        this.subjectId = subjectId;
    }

    public int getGroupId() {
        return groupId;
    }

    public void setGroupId(int groupId) {
        this.groupId = groupId;
    }
}
