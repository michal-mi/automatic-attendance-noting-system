package com.example.presenceqr.constants;

public class APIRoutes {
    public static String LOGIN = "auth/android";
    public static String ATTENDANCE = "groups/getDataAboutGroupSubject/";
    public static String ATTENDANCE_LIST = "classes/getAttendanceList/";
    public static String CLASS_DETAILS = "classes/getClasses/";
    public static String CLASSES_SCHEDULE_LECTURER = "classes/searchClasses/";
    public static String CLASSES_SCHEDULE_STUDENT = "classes/searchStudentClasses/";
    public static String PRESENCE_LECTURER = "groups/searchGroupsAndSubjects";
    public static String PRESENCE_STUDENT = "classes/getAttendanceListStudent";
    public static String LESSONS_LIST = "classes/classesCalendarForSubjectGroup/";
    public static String PASSWORD_RECOVERY = "users/initiatePasswordChange/";
    public static String PROFILE_LECTURER = "users/oneLecturerDataByIDAndroid/";
    public static String PROFILE_STUDENT = "users/oneStudentDataByIDAndroid/";
    public static String QR_CODE = "classes/changePresenceStatus/";

}
