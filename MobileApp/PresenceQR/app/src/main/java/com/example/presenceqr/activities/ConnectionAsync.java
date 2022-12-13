package com.example.presenceqr.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;

import com.example.presenceqr.constants.ResponseCodes;
import com.example.presenceqr.enums.RequestType;
import com.example.presenceqr.interfaces.AsyncPostResponse;
import com.example.presenceqr.interfaces.AsyncUpdateResponse;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

// A class that performs the asynchronous task of making a POST or UPDATE request to a server.
// Designed to send and receive data stored as a JSON string
public class ConnectionAsync extends AsyncTask<String, Void, String> {
    AlertDialog dialog;
    Context context;
    RequestType requestType;
    String jwt;
    int responseCode;
    // delegates of interfaces
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
    protected void onPostExecute(String responseJsonString) {
        dialog.dismiss();
            if(responseCode != ResponseCodes.WRONG_REQUEST_DATA && responseCode != ResponseCodes.NON_AUTHORIZED
                    && responseCode != ResponseCodes.SERVER_INTERNAL_ERROR) {
                if (requestType == RequestType.POST)
                    postDelegate.onPostExecute(responseJsonString, responseCode);
                if (requestType == RequestType.UPDATE)
                    updateDelegate.onUpdateExecute(responseJsonString, responseCode);
            }
            else{
                manageErrorResponseCode(responseCode);
            }
    }
    @Override
    protected String doInBackground(String... strings) {
        StringBuilder result = new StringBuilder();
        String jsonStringInput = strings[0],
        connectionString = strings[1];
        HttpURLConnection connection;
        try {
            // Creation and initialization of connection
            URL url = new URL(connectionString);
            connection = (HttpURLConnection) url.openConnection();
            initializeConnection(connection);

            // Sending data to server
            DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream());
            sendDataToServer(outputStream, jsonStringInput);

            responseCode = connection.getResponseCode();
            // if request was correct then it is possible to read response data
            if(responseCode == ResponseCodes.OK) {
                // Receiving response data from server
                InputStream inputStream = connection.getInputStream();
                result.append(receiveDataFromServer(inputStream));
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
        return result.toString();
    }

    private void initializeConnection(HttpURLConnection connection) throws IOException {
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        if(!jwt.equals(""))
            connection.setRequestProperty("Authorization", jwt);
        connection.setDoInput(true);
        connection.setDoOutput(true);
        connection.connect();
    }

    private void sendDataToServer(DataOutputStream outputStream, String jsonStringInput) throws IOException {
        outputStream.writeBytes(jsonStringInput);
        outputStream.flush();
        outputStream.close();
    }
    private String receiveDataFromServer(InputStream inputStream) throws IOException {
        StringBuilder response = new StringBuilder("");
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        String line = "";
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();
        inputStream.close();
        return response.toString();
    }
    private void manageErrorResponseCode(int responseCode){
        if(responseCode == ResponseCodes.WRONG_REQUEST_DATA){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Błąd żądania");
            alertDialog.setMessage("Błędne dane żądania.");
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
        if(responseCode == ResponseCodes.NON_AUTHORIZED){
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
        if(responseCode == ResponseCodes.SERVER_INTERNAL_ERROR){
            AlertDialog.Builder alertDialog = new AlertDialog.Builder(context);
            alertDialog.setTitle("Błąd serwera");
            alertDialog.setMessage("Wewnętrzny błąd serwera.");
            AlertDialog dialog = alertDialog.create();
            dialog.show();
        }
    }
}
