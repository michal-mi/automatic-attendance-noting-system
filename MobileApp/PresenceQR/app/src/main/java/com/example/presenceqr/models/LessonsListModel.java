package com.example.presenceqr.models;

public class LessonsListModel {
    private String date;
    private String startingHour;
    private String endingHour;

    public LessonsListModel(String date, String startingHour, String endingHour) {
        this.date = date;
        this.startingHour = startingHour;
        this.endingHour = endingHour;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getStartingHour() {
        return startingHour;
    }

    public void setStartingHour(String startingHour) {
        this.startingHour = startingHour;
    }

    public String getEndingHour() {
        return endingHour;
    }

    public void setEndingHour(String endingHour) {
        this.endingHour = endingHour;
    }
}
