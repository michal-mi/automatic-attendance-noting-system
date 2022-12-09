package com.example.presenceqr;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;

public class PasswordRecovery extends AppCompatActivity implements AsyncPostResponse {

    Button cancelButton, confirmButton;
    EditText emailEditText;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();

        setContentView(R.layout.password_recovery);
        emailEditText = findViewById(R.id.emailEditView);
        //zdarzenie kliknięcia przycisku "Anuluj"
        cancelButton = findViewById(R.id.cancelButton);
        cancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(PasswordRecovery.this, MainActivity.class));
                finish();
            }
        });
        confirmButton = findViewById(R.id.confirmButton);
        confirmButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                makeApiCall();
            }
        });


    }
    private void makeApiCall(){
        String jsonString = "{\"email\":\"" + emailEditText.getText().toString() + "\"}";
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, "");
        connectionAsync.postDelegate = this;
        connectionAsync.execute(jsonString, Config.serverAddress + "users/initiatePasswordChange/");
    }

    @Override
    public void onPostExecute(String jsonString, int responseCode) {
        if(!jsonString.equals("")){
            //startActivity(new Intent(PasswordRecovery.this, MainActivity.class));
            finish();
        }

    }
}
