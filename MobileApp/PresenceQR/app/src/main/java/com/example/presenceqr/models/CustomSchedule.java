package com.example.presenceqr.models;


import com.example.presenceqr.timetable.Schedule;

public class CustomSchedule extends Schedule {
    private int classId;
    private User user;
    public CustomSchedule(int classId, User user){
        super();
        this.classId = classId;
        this.user = user;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
