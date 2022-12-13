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
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;
import com.example.presenceqr.adapters.LessonsListAdapter;
import com.example.presenceqr.constants.APIRoutes;
import com.example.presenceqr.constants.Config;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.GroupSubject;
import com.example.presenceqr.models.LessonsListModel;
import com.example.presenceqr.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;

public class LessonsList extends AppCompatActivity implements AsyncPostResponse {
    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    RecyclerView recyclerView;
    RecyclerView.LayoutManager layoutManager;
    LessonsListAdapter adapter;
    ArrayList<LessonsListModel> lessonsList = new ArrayList<>();

    GroupSubject groupSubject;
    TextView groupTV, subjectTV;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        Intent intent = getIntent();
        user = intent.getParcelableExtra("user");
        groupSubject = intent.getParcelableExtra("groupSubject");
//        group = intent.getStringExtra("group");
//        subject = intent.getStringExtra("subject");
//        groupId = intent.getIntExtra("group_id", 0);
//        subjectId = intent.getIntExtra("subject_id", 0);
        setContentView(R.layout.list_of_lessons);
        groupTV = findViewById(R.id.group_text_view);
        groupTV.setText(groupSubject.getGroupName());
        subjectTV = findViewById(R.id.subject_text_view);
        subjectTV.setText(groupSubject.getSubjectName());
        //ustawienie Recycler View'a
        layoutManager = new LinearLayoutManager(this);
        recyclerView = findViewById(R.id.recycler_view);
        adapter = new LessonsListAdapter(this, lessonsList, user, groupSubject);
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(layoutManager);
        try {
            makeApiCall();
        } catch (JSONException e) {
            e.printStackTrace();
        }

        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(LessonsList.this, LecturerPresence.class);
                intent.putExtra("user", user);
                //startActivity(intent);
                finish();
            }
        });

        //zdarzenie kliknięcia ikonki "Strona główna"
        homeIcon = findViewById(R.id.homeIcon);
        homeIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(LessonsList.this, Home.class);
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
                Intent intent = new Intent(LessonsList.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
    private void makeApiCall() throws JSONException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("subject_group_id", groupSubject.getSubjectId() + "-" + groupSubject.getGroupId());
        jsonObject.put("facility_id", user.getFacilityId());
        connectionAsync.execute(jsonObject.toString(), Config.serverAddress + APIRoutes.LESSONS_LIST);
    }

    @Override
    public void onPostExecute(String responseJsonString, int responseCode) {

        try {
            JSONArray jsonArray = new JSONArray(responseJsonString);
            for(int i=0; i<jsonArray.length(); i++){
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                String date, beginHour, endHour, dateFormat;
                dateFormat = "dd.MM.YYYY";
                SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat);
                Calendar calendar = Calendar.getInstance();
                calendar.setTime(new SimpleDateFormat("yyyy-MM-dd").parse(jsonObject.getString("lesson_date")));
                calendar.add(Calendar.DATE, 1);

                date = simpleDateFormat.format(calendar.getTime());
                beginHour = jsonObject.getString("beginning_time");
                endHour = jsonObject.getString("ending_time");
                lessonsList.add(new LessonsListModel(date, beginHour, endHour));
            }
        } catch (JSONException | ParseException e) {
            e.printStackTrace();
        }
        adapter.notifyDataSetChanged();
    }
}
