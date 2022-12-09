package com.example.presenceqr;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TableRow;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.enums.UserRoleEnum;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.models.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Profile extends AppCompatActivity implements AsyncPostResponse {

    ImageButton backIcon, homeIcon, logoutIcon;
    Button changePasswordButton;
    User user;
    TextView firstNameTV, surnameTV, groupTV, idTV, statusInfoTV, titleTV;
    TableRow groupRow, titleRow;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        user = getIntent().getParcelableExtra("user");
        setContentView(R.layout.profile);
        initializeImageButtons();
        findViews();
        makeApiCall();

    }
    private void initializeImageButtons(){
        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
//                Intent intent = new Intent(Profile.this, Home.class);
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
                Intent intent = new Intent(Profile.this, Home.class);
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
                Intent intent = new Intent(Profile.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }
    private void findViews(){
        firstNameTV = findViewById(R.id.first_name_text_view);
        surnameTV = findViewById(R.id.surname_text_view);
        groupTV = findViewById(R.id.group_text_view);
        idTV = findViewById(R.id.id_text_view);
        titleTV = findViewById(R.id.title_text_view);
        groupRow = findViewById(R.id.group_row);
        titleRow = findViewById(R.id.title_row);
        statusInfoTV = findViewById(R.id.statusInfo);
        if(user.getUserRole() == UserRoleEnum.LECTURER.ordinal()) {
            groupRow.setVisibility(View.GONE);
            statusInfoTV.setText("Zalogowano jako prowadzący zajęcia");
        }
        else {
            titleRow.setVisibility(View.GONE);
            statusInfoTV.setText("Zalogowano jako student");
        }

        //zdarzenie kliknięcia przycisku "Zmień hasło"
        changePasswordButton = findViewById(R.id.change_password_button);
        changePasswordButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Profile.this, ChangePassword.class);
                intent.putExtra("user", user);
                startActivity(intent);
                finish();
            }
        });
    }
    private void makeApiCall(){
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        String jsonString = "{\"id\":" + user.getId() + "}";
        if(user.getUserRole() == UserRoleEnum.LECTURER.ordinal())
            connectionAsync.execute(jsonString, Config.serverAddress + "users/oneLecturerDataByIDAndroid/");
        else
            connectionAsync.execute(jsonString, Config.serverAddress + "users/oneStudentDataByIDAndroid/");
    }
    @Override
    public void onPostExecute(String jsonString, int responseCode) {
        try {
            JSONArray jsonArray = new JSONArray(jsonString);
            fillTextViews(jsonArray);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
    private void fillTextViews(JSONArray jsonArray) throws JSONException {
        String firstName, surname, title, group;
        JSONObject jsonObject = jsonArray.getJSONObject(0);
        firstName = jsonObject.getString("first_name");
        surname = jsonObject.getString("surname");
        title = jsonObject.getString("title");
        if(user.getUserRole() == UserRoleEnum.STUDENT.ordinal()){
            group = jsonObject.getString("group_name") + "\n";
            for(int i=1;i<jsonArray.length();i++){
                group += jsonArray.getJSONObject(i).getString("group_name") + "\n";
            }
            if(group.length() != 0)
                group = group.substring(0, group.length()-1);
            groupTV.setText(group);
        }
        else{
            titleTV.setText(title);
        }
        idTV.setText(Integer.toString(user.getId()));
        firstNameTV.setText(firstName);
        surnameTV.setText(surname);

    }
}
