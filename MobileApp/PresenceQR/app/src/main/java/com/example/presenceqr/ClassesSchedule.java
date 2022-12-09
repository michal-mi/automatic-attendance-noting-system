package com.example.presenceqr;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.enums.UserRoleEnum;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.models.CustomSchedule;
import com.example.presenceqr.models.User;
import com.example.presenceqr.timetable.Schedule;
import com.example.presenceqr.timetable.Time;
import com.example.presenceqr.timetable.TimetableView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class ClassesSchedule extends AppCompatActivity implements AsyncPostResponse {

    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    TimetableView timetableView;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.schedule);
        user = getIntent().getParcelableExtra("user");

        setupImageButtons();
        timetableView = findViewById(R.id.timetable);
        timetableView.setOnStickerSelectEventListener(new TimetableView.OnStickerSelectedListener() {
            @Override
            public void OnStickerSelected(int idx, ArrayList<Schedule> schedules) {
                Log.v("Index", Integer.toString(idx));
                CustomSchedule cs = (CustomSchedule) schedules.get(idx);
                Log.v("Class Id", Integer.toString(cs.getClassId()));

                int classId = cs.getClassId();
                User u = cs.getUser();
                Log.v("User jwt", u.getJwt());
                Intent intent = new Intent(ClassesSchedule.this, ClassDetails.class);
                intent.putExtra("user", u);
                intent.putExtra("classId", classId);
                startActivity(intent);

            }
        });
        try {
            makeApiCall();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void makeApiCall() throws JSONException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        JSONObject jsonObject = new JSONObject();
        if(user.getUserRole() == UserRoleEnum.LECTURER.ordinal()){
            //TODO lecturer api call
            //ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, "");
            jsonObject.put("lecturer_id", user.getId());
            jsonObject.put("facility_id", user.getFacilityId());
            jsonObject.put("classroom_id", "");
            jsonObject.put("group_id", "");
            //connectionAsync.execute(jsonObject.toString(), Config.serverAddress + "classes/lecturerCalendar/");
            connectionAsync.execute(jsonObject.toString(), Config.serverAddress + "classes/searchClasses/");

        }
        else if(user.getUserRole() == UserRoleEnum.STUDENT.ordinal()){
            //TODO student api call
            jsonObject.put("student_id", user.getId());
            jsonObject.put("facility_id", user.getFacilityId());
            jsonObject.put("classroom_id", "");
            jsonObject.put("group_id", "");
            connectionAsync.execute(jsonObject.toString(), Config.serverAddress + "classes/searchStudentClasses/");
        }

    }

    private void setupImageButtons(){
        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(ClassesSchedule.this, Home.class);
                intent.putExtra("user", user);
                startActivity(intent);
                finish();
            }
        });

        //zdarzenie kliknięcia ikonki "Strona główna"
        homeIcon = findViewById(R.id.homeIcon);
        homeIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(ClassesSchedule.this, Home.class);
                intent.putExtra("user", user);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });

        //zdarzenie kliknięcia ikonki "Wyloguj"
        logoutIcon = findViewById(R.id.logoutIcon);
        logoutIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(ClassesSchedule.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }

    @Override
    public void onPostExecute(String jsonString, int responseCode) {
        ArrayList<Schedule> schedules = new ArrayList<Schedule>();
        try {
            JSONArray jsonBigArray = new JSONArray(jsonString);
            for (int j=0;j<jsonBigArray.length();j++) {
                JSONArray jsonArray;
                //
                if(user.getUserRole() == UserRoleEnum.STUDENT.ordinal())
                    jsonArray = jsonBigArray.getJSONArray(j);
                else
                    jsonArray = jsonBigArray;
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject jsonObject = jsonArray.getJSONObject(i);
                    String subjectName = jsonObject.getString("subject_name");
                    String classroomName = jsonObject.getString("classroom_name");
                    String beginning_time = jsonObject.getString("beginning_time");
                    String ending_time = jsonObject.getString("ending_time");
                    String groupName = jsonObject.getString("group_name");
                    String lecturerName = jsonObject.getString("title") + " " + jsonObject.getString("first_name") + " " + jsonObject.getString("surname");
                    int dayOfWeek = jsonObject.getInt("day_of_week"),
                            classId = jsonObject.getInt("id");
                    int beginningHour = Integer.parseInt(beginning_time.substring(0, 2)),
                            beginningMinutes = Integer.parseInt(beginning_time.substring(3, 5)),
                            endingHour = Integer.parseInt(ending_time.substring(0, 2)),
                            endingMinutes = Integer.parseInt(ending_time.substring(3, 5));
                    //Log.v("Godzina", beginningHour + " " + beginningMinutes);

                    CustomSchedule customSchedule = new CustomSchedule(classId, user);
                    if(subjectName.length() >= 23)
                        subjectName = subjectName.substring(0, 20) + "...";
                    customSchedule.setClassTitle(subjectName);
                    if (user.getUserRole() == UserRoleEnum.LECTURER.ordinal())
                        customSchedule.setClassPlace(groupName + "\n" + classroomName);
                    if (user.getUserRole() == UserRoleEnum.STUDENT.ordinal())
                        customSchedule.setClassPlace(lecturerName + "\n" + classroomName);
                    customSchedule.setStartTime(new Time(beginningHour, beginningMinutes));
                    customSchedule.setEndTime(new Time(endingHour, endingMinutes));
                    customSchedule.setDay(dayOfWeek-1);
                    schedules.add(customSchedule);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if(schedules.size() != 0)
            timetableView.add(schedules);
//        try {
//            Log.v("JSONSTRING", jsonString);
//            SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            JSONArray jsonArray = new JSONArray(jsonString);
//            for(int i=0; i<jsonArray.length(); i++){
//                JSONObject jsonObject = jsonArray.getJSONObject(i);
//                String startDateString = jsonObject.getString("start"),
//                        endDateString = jsonObject.getString("end"),
//                        group = jsonObject.getString("Grupa"),
//                        classroom = jsonObject.getString("Sala");
//                int classId = jsonObject.getInt("id");
//                Date startDate = simpleDateFormat.parse(startDateString),
//                        endDate = simpleDateFormat.parse(endDateString);
//                Calendar calendar = Calendar.getInstance(), calendarEnd = Calendar.getInstance();
//                calendar.setTime(startDate);
//                calendarEnd.setTime(endDate);
//                //Day of week 1(Sunday) - 7(Saturday)
//                int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK),
//                        actualDayOfWeek = (dayOfWeek + 5) % 7;
//
//                while(calendar.get(Calendar.MINUTE) < calendarEnd.get(Calendar.MINUTE) &&
//                calendar.get(Calendar.HOUR_OF_DAY) < calendarEnd.get(Calendar.HOUR_OF_DAY)){
//                    String time =  calendar.get(Calendar.HOUR_OF_DAY) + ":" + calendar.get(Calendar.MINUTE);
//                    ScheduleModel scheduleModel=null;
//                    int scheduleIndex = -1;
//                    if(!coveredTimes.contains(time)){
//                        scheduleModel = new ScheduleModel(time);
//                        coveredTimes.add(time);
//                    }
//                    else{
//                        for(int j=0;j<scheduleList.size();j++){
//                            ScheduleModel temp = scheduleList.get(j);
//                            if(temp.getTime().equals(time)){
//                                scheduleModel = temp;
//                                scheduleIndex = j;
//                                break;
//                            }
//                        }
//                    }
//                    ClassInfoModel classInfoModel = new ClassInfoModel(classId, group, classroom);
//                    scheduleModel.setClassInfoArrayAt(actualDayOfWeek, classInfoModel);
//                    if(scheduleIndex != -1){
//                        scheduleList.set(scheduleIndex, scheduleModel);
//                    }
//                    else{
//                        scheduleList.add(scheduleModel);
//                    }
//                }
//
//
//            }
//        } catch (JSONException | ParseException e) {
//            e.printStackTrace();
//        }
    }
}
