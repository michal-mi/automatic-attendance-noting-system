package com.example.presenceqr;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;

import com.example.presenceqr.models.User;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;


public class MainActivity extends AppCompatActivity {
    Button remindPasswordButton, loginButton;
    EditText emailEditText, passwordEditText;
    String email, password;
    AlertDialog dialog;
    User user;
    LoginAsync loginTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.activity_main);

        // utworzenie obiektu klasy User który po zalogowaniu zostanie przekazany dalej
        user = new User();
        emailEditText = findViewById(R.id.emailEditView);
        passwordEditText = findViewById(R.id.passwordEditView);
        //zdarzenie kliknięcia przycisku "Przypomnij hasło"
        remindPasswordButton = findViewById(R.id.remindPasswordButton);
        remindPasswordButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(new Intent(MainActivity.this, PasswordRecovery.class));
            }
        });

        //zdarzenie kliknięcia przycisku "Zaloguj się"
        loginButton = findViewById(R.id.loginButton);
        // ustawienie przycisku na nieaktywny dopóki nie zostaną wprowadzone dane logowania zgodne ze schematem
        //setLoginButtonActive(false);

        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                boolean areInputsValid = validateInputs(emailEditText, passwordEditText);
                if (!areInputsValid) {
                    return;
                }
                loginTask = new LoginAsync(MainActivity.this);
                loginTask.execute(email, password);
                //startActivity(new Intent(MainActivity.this, Home.class));
            }
        });
    }

    // funkcja zmieniajaca stan przycisku logowania
    private void setLoginButtonActive(Boolean active) {
        if (active) {
            loginButton.setClickable(true);
            loginButton.setBackground(getDrawable(R.drawable.blue_button));
            loginButton.setTextColor(Color.parseColor("#FF000000"));
        } else {
            loginButton.setClickable(false);
            loginButton.setBackground(getDrawable(R.drawable.blue_button_inactive));
            loginButton.setTextColor(Color.parseColor("#80000000"));
        }
    }

    // funkcja zwracajaca true jesli email oraz haslo sa poprawnie wprowadzone lub false i ustawiająca odpowiedni błąd jeśli któreś z inputów jest niepoprawne
    private boolean validateInputs(EditText emailEditText, EditText passwordEditText) {
        email = emailEditText.getText().toString();
        if (email.length() == 0 || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            emailEditText.setError("Wprowadź adres e-mail.");
            return false;
        }

        password = passwordEditText.getText().toString();
        if (password.length() == 0) {
            passwordEditText.setError("Wprowadź hasło.");
            return false;
        }
        return true;
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState, @NonNull PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState, outPersistentState);
        //outState.putParcelable("user", user);
    }

    @Override
    public void onBackPressed() {
        this.moveTaskToBack(true);
    }

    class LoginAsync extends AsyncTask<String, Void, String> {

        AlertDialog dialog;
        Context context;

        public LoginAsync(Context context) {
            this.context = context;
        }

        @Override
        protected void onPreExecute() {
            dialog = new AlertDialog.Builder(context).create();
            dialog.setTitle("Status logowania");
            Activity activity = new Activity();

        }

        @Override
        protected void onPostExecute(String s) {
            if (!s.equals("")) {
                dialog.setMessage(s);
                dialog.show();
            }
        }

        @Override
        protected String doInBackground(String... strings) {
            StringBuilder result = new StringBuilder();
            String email = strings[0], password = strings[1], message = "";
            HttpURLConnection connection;
            String connectionString = Config.serverAddress + APIRouteNames.login;
            try {
                // Connecting to server
                URL url = new URL(connectionString);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("Accept", "application/json");
                connection.setDoInput(true);
                connection.setDoOutput(true);
                connection.connect();

                //Making JSON object with login data
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("email", email);
                jsonObject.put("password", password);

                // Sending data to server
                DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream());
                outputStream.writeBytes(jsonObject.toString());
                outputStream.flush();
                outputStream.close();

                int responseCode = connection.getResponseCode();
                // If data is correct
                if (responseCode == 200) {
                    // Reading response data
                    InputStream inputStream = connection.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                    String line = "";
                    while ((line = reader.readLine()) != null) {
                        result.append(line);
                    }

                    reader.close();
                    inputStream.close();
                    // Making JSON object with response data
                    jsonObject = new JSONObject(result.toString());
                    JSONObject data = jsonObject.getJSONObject("data");
                    // Creating User object that stores id and user role information for use to other activities
                    int id = data.getInt("id"),
                            userRole = data.getInt("userRole"),
                            facility = data.getInt("facility");
                    String jwt = data.getString("jwt");
                    User user = new User(id, userRole, facility, jwt);
                    // Making Intent that takes user to another activity
                    Intent intent = new Intent(MainActivity.this, Home.class);
                    intent.putExtra("user", user);
                    startActivity(intent);
                    MainActivity.this.finish();
                }
                //If data isn't correct, send message with error
                if (responseCode == 400 || responseCode == 401) {
                    message = "Błędny email lub hasło.";
                }
                if (responseCode == 500) {
                    message = "Wewnętrzny błąd serwera.";
                }
                connection.disconnect();
                return message;

            } catch (MalformedURLException e) {
                result = new StringBuilder(e.getMessage());
                Log.v("Error", "MalformedURL");
            } catch (IOException e) {
                result = new StringBuilder(e.getMessage());
                e.printStackTrace();
                Log.v("Error", "IOException");
            } catch (JSONException e) {
                e.printStackTrace();
                Log.v("Error", "JSON");
            }
            return result.toString();
        }
    }
}