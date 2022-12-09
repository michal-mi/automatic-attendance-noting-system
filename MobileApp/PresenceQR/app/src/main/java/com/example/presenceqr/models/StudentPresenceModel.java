package com.example.presenceqr.models;

public class StudentPresenceModel {
    private String subject;
    private String begginingTime;
    private String endingTime;
    private String presenceStatus;

    public StudentPresenceModel(String subject, String begginingTime, String endingTime, String presenceStatus) {
        this.subject = subject;
        this.begginingTime = begginingTime;
        this.endingTime = endingTime;
        this.presenceStatus = presenceStatus;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBegginingTime() {
        return begginingTime;
    }

    public void setBegginingTime(String begginingTime) {
        this.begginingTime = begginingTime;
    }

    public String getEndingTime() {
        return endingTime;
    }

    public void setEndingTime(String endingTime) {
        this.endingTime = endingTime;
    }

    public String getPresenceStatus() {
        return presenceStatus;
    }

    public void setPresenceStatus(String presenceStatus) {
        this.presenceStatus = presenceStatus;
    }
}
