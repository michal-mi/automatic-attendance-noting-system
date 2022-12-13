package com.example.presenceqr.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.presenceqr.R;
import com.example.presenceqr.constants.APIRoutes;
import com.example.presenceqr.constants.Config;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ClassDetails extends AppCompatActivity implements AsyncPostResponse {
    ImageButton backIcon, homeIcon, logoutIcon;
    TextView dayOfWeekTV, startingHourTV, endingHourTV, classroomTV, subjectTV, groupTV, lecturerTV;
    User user;
    int classId;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        getDataFromIntent(getIntent());
        setContentView(R.layout.lesson_details);
        initializeImageButtons();
        initializeTextViews();
        makeApiCall();
    }

    private void getDataFromIntent(Intent intent){
        user = intent.getParcelableExtra("user");
        classId = intent.getIntExtra("classId", 0);
    }
    private void makeApiCall() {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        String jsonString = "{\"id\":" + classId + "}";
        connectionAsync.execute(jsonString, Config.serverAddress + APIRoutes.CLASS_DETAILS);
    }

    private void initializeTextViews() {
        dayOfWeekTV = findViewById(R.id.day_of_week_text_view);
        startingHourTV = findViewById(R.id.starting_hour_text_view);
        endingHourTV = findViewById(R.id.ending_hour_text_view);
        classroomTV = findViewById(R.id.classroom_text_view);
        subjectTV = findViewById(R.id.subject_text_view);
        groupTV = findViewById(R.id.group_text_view);
        lecturerTV = findViewById(R.id.lecturer_text_view);
    }

    @Override
    public void onPostExecute(String responseJsonString, int responseCode) {
        try {
            JSONArray jsonArray = new JSONArray(responseJsonString);
            JSONObject jsonObject = jsonArray.getJSONObject(0);
            int dayOfWeek = jsonObject.getInt("day_of_week");
            String dayOfWeekString = getDayOfWeekString(dayOfWeek),
                    lecturerString = jsonObject.getString("title") + " " +
                            jsonObject.getString("first_name") + " " + jsonObject.getString("surname"),
                    startingHour = jsonObject.getString("beginning_time").substring(0,5),
                    endingHour = jsonObject.getString("ending_time").substring(0, 5),
                    subject = jsonObject.getString("subject_name"),
                    group = jsonObject.getString("group_name"),
                    classroom = jsonObject.getString("classroom_name");
            dayOfWeekTV.setText(dayOfWeekString);
            startingHourTV.setText(startingHour);
            endingHourTV.setText(endingHour);
            lecturerTV.setText(lecturerString);
            subjectTV.setText(subject);
            groupTV.setText(group);
            classroomTV.setText(classroom);

        } catch (JSONException e) {
            e.printStackTrace();
        }

    }
    private String getDayOfWeekString(int dayOfWeek){
        String dayOfWeekString;
        switch(dayOfWeek){
            case 1:
                dayOfWeekString = "Poniedziałek";
                break;
            case 2:
                dayOfWeekString = "Wtorek";
                break;
            case 3:
                dayOfWeekString = "Środa";
                break;
            case 4:
                dayOfWeekString = "Czwartek";
                break;
            case 5:
                dayOfWeekString = "Piątek";
                break;
            case 6:
                dayOfWeekString = "Sobota";
                break;
            case 7:
                dayOfWeekString = "Niedziela";
                break;
            default:
                dayOfWeekString = "Poniedziałek";
                break;
        }
        return dayOfWeekString;
    }
    private void initializeImageButtons(){
        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
//                Intent intent = new Intent(ClassDetails.this, Home.class);
//                intent.putExtra("user", user);
//                startActivity(intent);
                finish();
            }
        });
        //zdarzenie kliknięcia ikonki "Strona główna"
        homeIcon = findViewById(R.id.homeIcon);
        homeIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(ClassDetails.this, Home.class);
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
                Intent intent = new Intent(ClassDetails.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
}
