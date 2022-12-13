package com.example.presenceqr.activities;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.ImageButton;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.R;
import com.example.presenceqr.adapters.StudentPresenceAdapter;
import com.example.presenceqr.constants.APIRoutes;
import com.example.presenceqr.constants.Config;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.models.StudentPresenceModel;
import com.example.presenceqr.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Locale;

public class StudentPresence extends AppCompatActivity implements AsyncPostResponse {

    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    String selectedDate;
    EditText editTextDate;
    Button showAttendancesButton;
    Calendar calendar = Calendar.getInstance();
    RecyclerView recyclerView;
    RecyclerView.LayoutManager layoutManager;
    StudentPresenceAdapter adapter;
    ArrayList<StudentPresenceModel> studentPresenceList = new ArrayList<>();
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        user = getIntent().getParcelableExtra("user");
        setContentView(R.layout.student_presence);
        editTextDate = findViewById(R.id.editTextDate);
        Locale.setDefault(new Locale("pl"));

        String dateFormat = "dd/MM/yyyy";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat, Locale.getDefault());
        editTextDate.setText(simpleDateFormat.format(calendar.getTime()));

        try {
            makeApiCall();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        //ustawienie Recycler View'a
        layoutManager = new LinearLayoutManager(this);
        recyclerView = findViewById(R.id.recycler_view);
        adapter = new StudentPresenceAdapter(this, studentPresenceList);
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(layoutManager);
        showAttendancesButton = (Button) findViewById(R.id.show_attendance_button);
        showAttendancesButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                try {
                    makeApiCall();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        DatePickerDialog.OnDateSetListener date = new DatePickerDialog.OnDateSetListener() {
            @Override
            public void onDateSet(DatePicker datePicker, int year, int month, int day) {
                calendar.set(Calendar.YEAR, year);
                calendar.set(Calendar.MONTH, month);
                calendar.set(Calendar.DAY_OF_MONTH, day);
                String dateFormat = "dd.MM.yyyy";
                SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat, Locale.getDefault());
                editTextDate.setText(simpleDateFormat.format(calendar.getTime()));
            }
        };
        editTextDate.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                DatePickerDialog datePickerDialog = new DatePickerDialog(StudentPresence.this, date,
                        calendar.get(Calendar.YEAR),
                        calendar.get(Calendar.MONTH),
                        calendar.get(Calendar.DAY_OF_MONTH));
                datePickerDialog.setTitle("Wybierz date:");
                datePickerDialog.setButton(DatePickerDialog.BUTTON_NEGATIVE, "Anuluj", datePickerDialog);
                datePickerDialog.show();
            }
            }

        );
        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(StudentPresence.this, Home.class);
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
                Intent intent = new Intent(StudentPresence.this, Home.class);
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
                Intent intent = new Intent(StudentPresence.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }



//    private void selectDate() {
//        String dateFormat = "dd/MM/yyyy";
//        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat, Locale.getDefault());
//        editTextDate.setText(simpleDateFormat.format(calendar.getTime()));
//    }
    private void makeApiCall() throws JSONException {
        String dateToSend;
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        String dateFormat = "yyyy-MM-dd";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(dateFormat);
        dateToSend = simpleDateFormat.format(calendar.getTime());
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("student_id", user.getId());
        jsonObject.put("date", dateToSend);
        connectionAsync.execute(jsonObject.toString(), Config.serverAddress + APIRoutes.PRESENCE_STUDENT);

    }

    @Override
    public void onPostExecute(String responseJsonString, int responseCode) {
        Log.v("JSONString:", responseJsonString);
        if(!responseJsonString.equals("")) {
            try {
                studentPresenceList.clear();
                JSONArray jsonArray = new JSONArray(responseJsonString);
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject jsonObject = jsonArray.getJSONObject(i);
                    String subject = jsonObject.getString("subject_name"),
                            beginningHour = jsonObject.getString("beginning_time").substring(0, 5),
                            endingHour = jsonObject.getString("ending_time").substring(0, 5),
                            status = "";
                    int presenceStatus = Integer.parseInt(jsonObject.getString("status_id"));
                    switch (presenceStatus) {
                        case 1:
                            status = "Nieobecność";
                            break;
                        case 2:
                            status = "Obecność";
                            break;
                        case 3:
                            status = "Usprawiedliwienie";
                            break;
                        case 4:
                            status = "Zwolnienie";
                        default:
                            status = "Błędny";
                            break;
                    }
                    studentPresenceList.add(new StudentPresenceModel(subject, beginningHour, endingHour, status));
                }
                Collections.sort(studentPresenceList, new Comparator<StudentPresenceModel>() {
                    @Override
                    public int compare(StudentPresenceModel studentPresenceModel1, StudentPresenceModel studentPresenceModel2) {
                        return studentPresenceModel1.getBegginingTime().compareTo(studentPresenceModel2.getBegginingTime());
                    }
                });
                adapter.notifyDataSetChanged();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }
}
