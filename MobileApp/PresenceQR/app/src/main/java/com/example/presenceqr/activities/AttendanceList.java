package com.example.presenceqr.activities;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;
import com.example.presenceqr.adapters.AttendanceListAdapter;
import com.example.presenceqr.constants.APIRoutes;
import com.example.presenceqr.constants.Config;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.interfaces.AsyncUpdateResponse;
import com.example.presenceqr.models.AttendanceListModel;
import com.example.presenceqr.GroupSubject;
import com.example.presenceqr.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;

public class AttendanceList extends AppCompatActivity implements AsyncPostResponse, AsyncUpdateResponse {
    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    GroupSubject groupSubject;
    RecyclerView recyclerView;
    RecyclerView.LayoutManager layoutManager;
    AttendanceListAdapter adapter;
    ArrayList<AttendanceListModel> attendanceList = new ArrayList<>();
    String date;
    TextView groupTV, subjectTV, dateTV;
    Button confirmButton;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.attendance_list);

        // get data from intent
        Intent intent  = getIntent();
        getDataFromIntent(intent);

        //initialization of components
        initializeTextViews();
        initializeImageButtons();
        initializeRecyclerView();

        // make call to server
        try {
            makeApiCall();
        } catch (JSONException | ParseException e) {
            e.printStackTrace();
        }


    }
    private void getDataFromIntent(Intent intent){
        user = intent.getParcelableExtra("user");
        groupSubject = intent.getParcelableExtra("groupSubject");
        date = intent.getStringExtra("date");
    }
    private void initializeImageButtons() {
        confirmButton = findViewById(R.id.confirm_attendance);
        confirmButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                try {
                    updateAttendanceList();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
//                Intent intent = new Intent(AttendanceList.this, LecturerPresence.class);
//                intent.putExtra("user", user);
                //startActivity(intent);
                finish();
            }
        });

        //zdarzenie kliknięcia ikonki "Strona główna"
        homeIcon = findViewById(R.id.homeIcon);
        homeIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(AttendanceList.this, Home.class);
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
                Intent intent = new Intent(AttendanceList.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
    private void initializeTextViews(){
        // setting up text views
        groupTV = findViewById(R.id.group_text_view);
        groupTV.setText(groupSubject.getGroupName());
        subjectTV = findViewById(R.id.subject_text_view);
        subjectTV.setText(groupSubject.getSubjectName());
        dateTV = findViewById(R.id.date_tv);
        dateTV.setText(date);
    }
    private void initializeRecyclerView(){
        layoutManager = new LinearLayoutManager(this);
        recyclerView = findViewById(R.id.recycler_view);
        adapter = new AttendanceListAdapter(this, attendanceList);
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(layoutManager);
    }
    private void makeApiCall() throws JSONException, ParseException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("facility_id", user.getFacilityId());
        jsonObject.put("subject_group_id", groupSubject.getSubjectId() + "-" + groupSubject.getGroupId());
        String dateFormat = "yyyy-MM-dd", dateToSend;
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat);
        dateToSend = simpleDateFormat.format(new SimpleDateFormat("dd.MM.yyyy").parse(date));
        jsonObject.put("lecturer_id", user.getId());
        jsonObject.put("lesson_date", dateToSend);
        connectionAsync.execute(jsonObject.toString(), Config.serverAddress + APIRoutes.ATTENDANCE_LIST);
    }
    private void updateAttendanceList() throws JSONException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.UPDATE, user.getJwt());
        connectionAsync.updateDelegate = this;
        JSONArray jsonArray = new JSONArray();
        JSONObject jsonObjectToSend, jsonObject;
        for(AttendanceListModel model : attendanceList){
            jsonObject = new JSONObject();
            jsonObject.put("id", model.getId());
            jsonObject.put("status_id", model.getAttendanceStatus());
            jsonArray.put(jsonObject);
        }
        jsonObjectToSend = new JSONObject();
        jsonObjectToSend.put("attendance_list", jsonArray);
        connectionAsync.execute(jsonObjectToSend.toString(), Config.serverAddress + "classes/changeAttendanceList/");

    }
    @Override
    public void onPostExecute(String responseJsonString, int responseCode) {
        JSONArray jsonArray = null, actualJsonArray = null;
        try {
            jsonArray = new JSONArray(responseJsonString);
            actualJsonArray = jsonArray.getJSONArray(0);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        for(int i=0; i<actualJsonArray.length(); i++){
            try {
                JSONObject jsonObject = actualJsonArray.getJSONObject(i);
                String surname, name;
                int id, attendanceStatus;
                surname = jsonObject.getString("surname");
                name = jsonObject.getString("first_name");
                id = jsonObject.getInt("id");
                attendanceStatus = jsonObject.getInt("status_id");
                attendanceList.add(new AttendanceListModel(surname, name, Integer.toString(id), attendanceStatus));

            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
        adapter.notifyDataSetChanged();
    }


    @Override
    public void onUpdateExecute(String responseJsonString, int responseCode) {
        AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
        alertDialog.setTitle("Pomyślnie dokonano zmian");
        alertDialog.setMessage("Zaktualizowano listę obecności.");
        alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                dialogInterface.dismiss();
            }
        });
        AlertDialog dialog = alertDialog.create();
        dialog.show();
    }
}
