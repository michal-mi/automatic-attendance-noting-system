package com.example.presenceqr.models;

public class ScheduleModel {
    private String time;
    private ClassInfoModel[] classInfoArray;

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public ClassInfoModel[] getClassInfoArray() {
        return classInfoArray;
    }

    public void setClassInfoArray(ClassInfoModel[] classInfoArray) {
        this.classInfoArray = classInfoArray;
    }
    public void setClassInfoArrayAt(int i, ClassInfoModel classInfo){
        this.classInfoArray[i] = classInfo;
    }
    public ClassInfoModel getClassInfoArrayAt(int i){
        return classInfoArray[i];
    }
    public ScheduleModel(String time) {
        this.time = time;
        this.classInfoArray = new ClassInfoModel[7];
    }
}
