package com.example.presenceqr;

import android.content.Intent;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageButton;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.presenceqr.enums.UserRoleEnum;
import com.example.presenceqr.models.User;

public class Home extends AppCompatActivity {

    Button presenceButton, scheduleButton, scanButton;
    ImageButton userIcon, settingsIcon, logoutIcon;
    User user;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.home);
        user = getIntent().getParcelableExtra("user");
        Log.v("jwt:", user.getJwt());
        //zdarzenie kliknięcia ikonki "Moje konto"
        userIcon = findViewById(R.id.userIcon);
        userIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Home.this, Profile.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });

        //zdarzenie kliknięcia ikonki "Ustawienia"
        settingsIcon = findViewById(R.id.settingsIcon);
        settingsIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Home.this,Settings.class);
                intent.putExtra("user", user);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
            }
        });

        //zdarzenie kliknięcia ikonki "Wyloguj"
        logoutIcon = findViewById(R.id.logoutIcon);
        logoutIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Home.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });

        //zdarzenie kliknięcia przycisku "Obecności" jako wykładowca
        presenceButton = findViewById(R.id.presenceButton);
        presenceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent;
                if(user.getUserRole() == UserRoleEnum.LECTURER.ordinal())
                    intent = new Intent(Home.this, LecturerPresence.class);
                else
                    intent = new Intent(Home.this, StudentPresence.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });

        //zdarzenie kliknięcia przycisku "Plan zajęć"
        scheduleButton = findViewById(R.id.scheduleButton);
        scheduleButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Home.this, ClassesSchedule.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });

        //zdarzenie kliknięcia przycisku "Skanuj kod QR"
        scanButton = findViewById(R.id.scanButton);
        if(user.getUserRole() == UserRoleEnum.STUDENT.ordinal())
        scanButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Home.this, QRCode.class);
                intent.putExtra("user", user);
                startActivity(intent);
            }
        });
        else {
            scanButton.setVisibility(View.GONE);
            scanButton.setClickable(false);
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

    @Override
    public void onBackPressed() {
        this.moveTaskToBack(true);
    }
}
