package com.example.presenceqr;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.util.Log;

import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.interfaces.AsyncUpdateResponse;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;

// Klasa realizująca zadanie asynchroniczne polegające na wykonaniu żądania POST do serwera
// Przeznaczona do wysyłania i odbierania danych przechowywanych jako łańcuch znaków JSON
public class ConnectionAsync extends AsyncTask<String, Void, String> {
    AlertDialog dialog;
    Context context;
    RequestType requestType;
    String jwt;
    int responseCode;
    // stworzenie delegata interfejsu
    public AsyncPostResponse postDelegate = null;
    public AsyncUpdateResponse updateDelegate = null;
    public ConnectionAsync(Context context, RequestType requestType, String jwt){
        this.context = context;
        this.requestType = requestType;
        this.jwt = jwt;
    }
    @Override
    protected void onPreExecute() {
        dialog = new AlertDialog.Builder(context).create();
        dialog.setTitle("Proszę czekać...");
        dialog.show();
        dialog.setCancelable(false);
    }
    @Override
    protected void onPostExecute(String jsonString) {
        dialog.dismiss();
            if(responseCode != 401) {
                if (requestType == RequestType.POST)
                    postDelegate.onPostExecute(jsonString, responseCode);
                if (requestType == RequestType.UPDATE)
                    updateDelegate.onUpdateExecute(jsonString);
            }
            else{
                ManageErrorResponseCode(responseCode);
            }
    }
    @Override
    protected String doInBackground(String... strings) {
        StringBuilder result = new StringBuilder();
        String jsonStringInput = strings[0],
        connectionString = strings[1];
        String jsonStringOutput="";
        HttpURLConnection connection;

        try {
            // Stworzenie i ustawienie połączenia
            URL url = new URL(connectionString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            if(!jwt.equals(""))
                connection.setRequestProperty("Authorization", jwt);
            //connection.setRequestMethod("Authorization", );
            connection.setDoInput(true);
            connection.setDoOutput(true);
            connection.connect();
            //responseCode = connection.getResponseCode();

                // Wysłanie danych do serwera
                DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream());
                outputStream.writeBytes(jsonStringInput);
                outputStream.flush();
                outputStream.close();
                responseCode = connection.getResponseCode();
                if(responseCode == 200) {
                    InputStream inputStream = connection.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                    String line = "";

                    while ((line = reader.readLine()) != null) {
                        result.append(line);
                    }
                    reader.close();
                    inputStream.close();
                }


        } catch (ProtocolException e) {
            e.printStackTrace();
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        Log.v("JSONString:", result.toString());
        return result.toString();
    }
    private void ManageErrorResponseCode(int responseCode){
        if(responseCode == 400){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Błąd żądania");
            alertDialog.setMessage("Błędne dane żądania.");
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        if(responseCode == 401){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Nieautoryzowanany dostęp");
            alertDialog.setCancelable(false);
            alertDialog.setMessage("Wystąpił błąd autoryzacji użytkownika. Zaloguj się ponownie, a jeśli błąd będzie się dalej pojawiać skontaktuj się z administracją.");
            alertDialog.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    dialog.dismiss();
                    Intent intent = new Intent(context, MainActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                            | Intent.FLAG_ACTIVITY_CLEAR_TOP
                            | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    context.startActivity(intent);
                }
            });
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        if(responseCode == 500){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Błąd serwera");
            alertDialog.setMessage("Wewnętrzny błąd serwera.");
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
    }
}
