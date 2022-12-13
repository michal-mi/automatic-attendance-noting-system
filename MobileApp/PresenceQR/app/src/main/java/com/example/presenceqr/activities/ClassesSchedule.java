package com.example.presenceqr.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.presenceqr.R;
import com.example.presenceqr.constants.APIRoutes;
import com.example.presenceqr.constants.Config;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.enums.UserRoleEnum;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.CustomSchedule;
import com.example.presenceqr.User;
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
        initializeTimetableView();

        try {
            makeApiCall();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void initializeTimetableView(){
        timetableView = findViewById(R.id.timetable);
        timetableView.setOnStickerSelectEventListener(new TimetableView.OnStickerSelectedListener() {
            @Override
            public void OnStickerSelected(int idx, ArrayList<Schedule> schedules) {

                CustomSchedule cs = (CustomSchedule) schedules.get(idx);
                int classId = cs.getClassId();
                User u = cs.getUser();

                Intent intent = new Intent(ClassesSchedule.this, ClassDetails.class);
                intent.putExtra("user", u);
                intent.putExtra("classId", classId);

                startActivity(intent);

            }
        });
    }

    private void makeApiCall() throws JSONException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        JSONObject jsonObject = new JSONObject();
        if(user.getUserRole() == UserRoleEnum.LECTURER.ordinal()){
            jsonObject.put("lecturer_id", user.getId());
            jsonObject.put("facility_id", user.getFacilityId());
            jsonObject.put("classroom_id", "");
            jsonObject.put("group_id", "");
            connectionAsync.execute(jsonObject.toString(), Config.serverAddress + APIRoutes.CLASSES_SCHEDULE_LECTURER);

        }
        else if(user.getUserRole() == UserRoleEnum.STUDENT.ordinal()){
            jsonObject.put("student_id", user.getId());
            jsonObject.put("facility_id", user.getFacilityId());
            jsonObject.put("classroom_id", "");
            jsonObject.put("group_id", "");
            connectionAsync.execute(jsonObject.toString(), Config.serverAddress + APIRoutes.CLASSES_SCHEDULE_STUDENT);
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
    public void onPostExecute(String responseJsonString, int responseCode) {
        ArrayList<Schedule> schedules = new ArrayList<Schedule>();
        try {
            JSONArray jsonBigArray = new JSONArray(responseJsonString);
            for (int j=0;j<jsonBigArray.length();j++) {
                JSONArray jsonArray;
                if(user.getUserRole() == UserRoleEnum.STUDENT.ordinal())
                    jsonArray = jsonBigArray.getJSONArray(j);
                else
                    jsonArray = jsonBigArray;

                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject jsonObject = jsonArray.getJSONObject(i);
                    CustomSchedule customSchedule = createCustomSchedule(jsonObject);
                    schedules.add(customSchedule);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        if(schedules.size() != 0)
            timetableView.add(schedules);
    }
    private CustomSchedule createCustomSchedule(JSONObject jsonObject) throws JSONException {
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

        return customSchedule;
    }
}
