package com.example.presenceqr;

import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Spinner;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.presenceqr.adapters.LecturerPresenceAdapter;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.models.LecturerPresenceModel;
import com.example.presenceqr.models.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

public class LecturerPresence extends AppCompatActivity implements AsyncPostResponse {

    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    String selectedSubject, selectedGroup;
    Spinner subjectSpinner, groupSpinner;
    Button filterButton;
    RecyclerView recyclerView;
    RecyclerView.LayoutManager layoutManager;
    LecturerPresenceAdapter adapter;
    ArrayList<LecturerPresenceModel> lecturerPresenceList = new ArrayList<>(), filteredList = new ArrayList<>();
    ArrayList<String> groups = new ArrayList<>(), subjects = new ArrayList<>();
    ArrayAdapter<String> subjectAdapter, groupAdapter;
    Resources resources;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        user = getIntent().getParcelableExtra("user");
        setContentView(R.layout.lecturer_presence);
        resources = getResources();

        //LecturerPresenceModel model1 = new LecturerPresenceModel("Informatyka", "Grupa 1"),
        //model2 = new LecturerPresenceModel("Elektrotechnika", "Grupa 2");
        //lecturerPresenceList.add(model1);
        //lecturerPresenceList.add(model2);
        //filteredList.addAll(lecturerPresenceList);

        //ustawienie Recycler View'a
        layoutManager = new LinearLayoutManager(this);
        recyclerView = findViewById(R.id.recycler_view);
        adapter = new LecturerPresenceAdapter(this, filteredList, user);
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(layoutManager);

        subjectSpinner = findViewById(R.id.subject_spinner);
        groupSpinner = findViewById(R.id.lecturer_presence_group_spinner);
        subjects.add(resources.getString(R.string.subject_spinner_default));
        groups.add(resources.getString(R.string.group_spinner_default));

        subjectAdapter = new ArrayAdapter<String>(this, R.layout.spinner_item, subjects);
        subjectSpinner.setAdapter(subjectAdapter);

        groupAdapter = new ArrayAdapter<>(this, R.layout.spinner_item, groups);
        groupSpinner.setAdapter(groupAdapter);

        filterButton = findViewById(R.id.filterButton);
        filterButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String selectedSubject="", selectedGroup="";
                if(subjectSpinner.getSelectedItemPosition() != 0)
                    selectedSubject = subjectSpinner.getSelectedItem().toString();
                if(groupSpinner.getSelectedItemPosition() != 0)
                    selectedGroup = groupSpinner.getSelectedItem().toString();
                filteredList.clear();
                for (LecturerPresenceModel model : lecturerPresenceList)
                {
                    if(!selectedSubject.equals("") && !selectedGroup.equals("")) {
                        if(model.getSubject().equals(selectedSubject) && model.getGroup().equals(selectedGroup))
                            filteredList.add(model);
                        continue;
                    }
                    if(!selectedSubject.equals("")){
                        if(model.getSubject().equals(selectedSubject))
                            filteredList.add(model);
                        continue;
                    }
                    if(!selectedGroup.equals("")){
                        if(model.getGroup().equals(selectedGroup)){
                            filteredList.add(model);
                        }
                        continue;
                    }
                    filteredList.addAll(lecturerPresenceList);
                    break;
                }
                adapter.notifyDataSetChanged();
            }
        });

        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(LecturerPresence.this, Home.class);
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
                Intent intent = new Intent(LecturerPresence.this, Home.class);
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
                Intent intent = new Intent(LecturerPresence.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
        try {
            makeApiCall();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState, @NonNull PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState, outPersistentState);
        outState.putParcelable("user", user);
    }

    @Override
    protected void onRestoreInstanceState(@NonNull Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        user = savedInstanceState.getParcelable("user");
    }

    private void makeApiCall() throws JSONException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("facility_id", user.getFacilityId());
        jsonObject.put("lecturer_id", user.getId());
        jsonObject.put("subject_id", "");
        jsonObject.put("group_id", "");
        String jsonString = jsonObject.toString();
        Log.v("JSON string do wyslania: ", jsonString);
        connectionAsync.execute(jsonString, Config.serverAddress + "groups/searchGroupsAndSubjects");
    }
    //wykonanie czynnosci po odpowiedzi asynchronicznego zadania
    @Override
    public void onPostExecute(String jsonString, int responseCode) {
        try {
            JSONArray jsonArray = new JSONArray(jsonString);
            for(int i=0;i<jsonArray.length();i++){
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                String subjectName = jsonObject.getString("subject_name"),
                groupName = jsonObject.getString("group_name");
                int subjectId = jsonObject.getInt("subject_id"),
                        groupId = jsonObject.getInt("group_id");
                if(!subjects.contains(subjectName))
                    subjects.add(subjectName);
                if(!groups.contains(groupName))
                    groups.add(groupName);
                lecturerPresenceList.add(new LecturerPresenceModel(subjectName, subjectId, groupName, groupId));
                Log.v("List len", Integer.toString(lecturerPresenceList.size()));
            }
            Collections.sort(lecturerPresenceList, new Comparator<LecturerPresenceModel>() {
                @Override
                public int compare(LecturerPresenceModel lecturerPresenceModel, LecturerPresenceModel t1) {
                    return lecturerPresenceModel.getGroup().compareTo(t1.getGroup());
                }
            });
            //lecturerPresenceList.sort();
            filteredList.addAll(lecturerPresenceList);
            adapter.notifyDataSetChanged();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

}
