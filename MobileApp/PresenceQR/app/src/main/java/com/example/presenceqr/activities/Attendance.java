package com.example.presenceqr.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
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
import com.example.presenceqr.adapters.AttendanceAdapter;
import com.example.presenceqr.constants.APIRoutes;
import com.example.presenceqr.constants.Config;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.models.AttendanceModel;
import com.example.presenceqr.GroupSubject;
import com.example.presenceqr.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class Attendance extends AppCompatActivity  implements AsyncPostResponse {
    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    GroupSubject groupSubject;
    TextView subjectTV, groupTV;
    ArrayList<AttendanceModel> attendanceList = new ArrayList<>();
    RecyclerView recyclerView;
    RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(this);
    AttendanceAdapter adapter;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.attendance);

        //odebranie danych z intencji
        Intent intent = getIntent();
        user = intent.getParcelableExtra("user");
        groupSubject = intent.getParcelableExtra("groupSubject");
        subjectTV = findViewById(R.id.attendance_subject);
        groupTV = findViewById(R.id.attendance_group);
        subjectTV.setText(groupSubject.getSubjectName());
        groupTV.setText(groupSubject.getGroupName());

        //ustawienie Recycler View'a
        layoutManager = new LinearLayoutManager(this);
        recyclerView = findViewById(R.id.attendance_recycler_view);
        adapter = new AttendanceAdapter(this, attendanceList);
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
                Intent intent = new Intent(Attendance.this, LecturerPresence.class);
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

                Intent intent = new Intent(Attendance.this, Home.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                intent.putExtra("user", user);
                startActivity(intent);
                finish();
            }
        });

        //zdarzenie kliknięcia ikonki "Wyloguj"
        logoutIcon = findViewById(R.id.logoutIcon);
        logoutIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Attendance.this, MainActivity.class);
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
        connectionAsync.execute(jsonObject.toString(), Config.serverAddress + APIRoutes.ATTENDANCE);


    }

    @Override
    public void onPostExecute(String responseJsonString, int responseCode) {
        try {
            Log.v("JsonString:", responseJsonString);
            JSONArray jsonArray = new JSONArray(responseJsonString),
            studentsJsonArray = jsonArray.getJSONArray(1);
            for(int i=0; i<studentsJsonArray.length(); i++){
                JSONObject jsonObject = studentsJsonArray.getJSONObject(i);
                String firstName;
                String surname;
                int id;
                double attendance;
                id = jsonObject.getInt("id");
                firstName = jsonObject.getString("first_name");
                surname = jsonObject.getString("surname");
                attendance = jsonObject.getDouble("presentAmount");
                attendanceList.add(new AttendanceModel(surname, firstName,id, attendance));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        adapter.notifyDataSetChanged();
    }

}
