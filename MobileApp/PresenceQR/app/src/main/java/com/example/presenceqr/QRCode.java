package com.example.presenceqr;

import static android.Manifest.permission.ACCESS_FINE_LOCATION;
import static android.Manifest.permission.CAMERA;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;

import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.budiyev.android.codescanner.CodeScanner;
import com.budiyev.android.codescanner.CodeScannerView;
import com.budiyev.android.codescanner.DecodeCallback;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.models.User;

import com.example.presenceqr.viewholders.ErrorManager;
import com.google.zxing.Result;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class QRCode extends AppCompatActivity implements AsyncPostResponse {

    ImageButton backIcon, homeIcon, logoutIcon;
    User user;
    private CodeScanner codeScanner = null;
    private Location location;
    private EditText codeEditText;
    private String qrCode;
    private Button confirmCodeButton;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //wyłączenie górnego paska aplikacji
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getSupportActionBar().hide();
        setContentView(R.layout.qr_code);
        user = getIntent().getParcelableExtra("user");
        codeEditText = findViewById(R.id.codeEditText);
        confirmCodeButton = findViewById(R.id.confirm_code_button);
        confirmCodeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                qrCode = codeEditText.getText().toString();
                try {
                    makeApiCall();
                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        });
        setupImageButtons();
        // run check for required permissions, if certain permissions are met, then corresponding elements will be initialized
        checkRequiredPermissions();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if(requestCode == 100){
            if(permissions.length > 0) {
                for (int i = 0; i < permissions.length; i++) {
                    if (permissions[i].equals(CAMERA) && grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                        initializeCodeScanner();
                    }
                    if (permissions[i].equals(ACCESS_FINE_LOCATION) && grantResults[i] == PackageManager.PERMISSION_GRANTED){
                        initializeLocationManagement();
                    }
                    else if(permissions[i].equals(ACCESS_FINE_LOCATION) && grantResults[i] == PackageManager.PERMISSION_DENIED) {
                            Log.v("happens", "yes");
                        AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
                        alertDialog.setTitle("Potrzebne uprawnienia do odczytu lokalizacji");
                        alertDialog.setCancelable(false);
                        alertDialog.setMessage("W celu poprawnego działania, aplikacja potrzebuje dostępu do lokalizacji");
                        alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                finish();
                            }
                        });
                        AlertDialog dialog = alertDialog.create();
                        dialog.show();
                    }
                }
            }
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
    private void checkRequiredPermissions(){
        ArrayList<String> permissionsToAsk = new ArrayList<>();
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToAsk.add(ACCESS_FINE_LOCATION);
        }
        else{
            initializeLocationManagement();
        }
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED)
        {
            permissionsToAsk.add(CAMERA);
        }
        else{
            initializeCodeScanner();
        }
        if(permissionsToAsk.size() != 0)
        {
            String[] temp = permissionsToAsk.toArray(new String[]{});
            ActivityCompat.requestPermissions(this, temp ,100);
        }
    }
    private void initializeCodeScanner(){
        CodeScannerView codeScannerView = findViewById(R.id.code_scanner);
        codeScanner = new CodeScanner(this, codeScannerView);
        codeScanner.setDecodeCallback(new DecodeCallback() {
            @Override
            public void onDecoded(@NonNull Result result) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        qrCode = result.getText();
                        Toast.makeText(QRCode.this, result.getText(), Toast.LENGTH_SHORT).show();
                        try {
                            makeApiCall();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        codeScanner.releaseResources();

                    }
                });
            }
        });
        codeScannerView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                codeScanner.startPreview();
            }
        });
    }
    @SuppressLint("MissingPermission")
    private void initializeLocationManagement(){
        LocationManager locationManager = (LocationManager)
                getSystemService(Context.LOCATION_SERVICE);
        LocationListener locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(@NonNull Location location) {
                QRCode.this.location = location;
                //codeEditText.setText(location.toString());

            }
        };
        locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER, 5000, 10, locationListener);
        location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
        //if(location != null)
            //codeEditText.setText(location.toString());
    }

    private void setupImageButtons(){
        //zdarzenie kliknięcia ikonki "Powrót"
        backIcon = findViewById(R.id.backIcon);
        backIcon.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(QRCode.this, Home.class);
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
                Intent intent = new Intent(QRCode.this, Home.class);
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
                Intent intent = new Intent(QRCode.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                finish();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if(codeScanner != null)
            codeScanner.startPreview();
    }

    @Override
    protected void onPause() {
        if(codeScanner != null)
            codeScanner.releaseResources();
        super.onPause();
    }
    private void makeApiCall() throws JSONException {
        ConnectionAsync connectionAsync = new ConnectionAsync(this, RequestType.POST, user.getJwt());
        connectionAsync.postDelegate = this;
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("user_id", user.getId());
        jsonObject.put("qr_code", qrCode);
        jsonObject.put("gps_x", location.getLongitude());
        jsonObject.put("gps_y", location.getLatitude());
        connectionAsync.execute(jsonObject.toString(), Config.serverAddress + "classes/changePresenceStatus/");
    }
    private void makeSimpleAlert(String message){
        AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
        alertDialog.setTitle("Komunikat");
        alertDialog.setMessage(message);
        alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                dialogInterface.dismiss();
                if(codeScanner != null)
                    codeScanner.startPreview();
            }
        });
        AlertDialog dialog = alertDialog.create();
        dialog.show();
    }
    @Override
    public void onPostExecute(String jsonString, int responseCode) {
        if (responseCode == 200) {
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
            alertDialog.setTitle("Komunikat");
            alertDialog.setMessage("Pomyślnie odnotowano obecność.");
            alertDialog.setCancelable(false);
            alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    dialogInterface.dismiss();
                    finish();
                }
            });
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        else if (responseCode == 433){
            makeSimpleAlert("Niepoprawna lokalizacja. Obecność nie została odnotowana.");
        }
        else if (responseCode == 432){
            makeSimpleAlert("Minął czas na odnotowanie obecności." +
                    " Obecność nie została odnotowana.");
        }
        else if (responseCode == 434){
            makeSimpleAlert("Obecność została już odnotowana.");
        }
        else{
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(this);
            alertDialog.setTitle("Komunikat");
            alertDialog.setMessage("Nieudana próba odnotowania obecności.");
            alertDialog.setCancelable(false);
            alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    dialogInterface.dismiss();
                    if(codeScanner != null)
                        codeScanner.startPreview();
                }
            });
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        //ErrorManager.ManageErrorResponseCode(responseCode, this);
    }
}
